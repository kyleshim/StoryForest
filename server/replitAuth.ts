import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Configure session middleware with PostgreSQL session store
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      const user = await upsertUser(claims);
      
      // Create a user object with session info
      const userWithSession = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        isPublic: user.isPublic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Add session info
        claims: claims,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: claims?.exp
      };
      
      verified(null, userWithSession);
    } catch (error) {
      console.error("Error in verify function:", error);
      verified(error as Error);
    }
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `http://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log('Login request received, hostname:', req.hostname);
    
    // Use standard passport authenticate with redirect
    passport.authenticate(`replitauth:${req.hostname}`, {
      scope: ["openid", "email", "profile", "offline_access"],
      prompt: "login consent"
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log('Callback received:', req.url);
    
    // Log query parameters but sanitize sensitive information
    const queryParams = Object.keys(req.query);
    console.log('Query parameters:', queryParams);
    
    if (req.query.error) {
      console.error('Auth error:', req.query.error);
      console.error('Error description:', req.query.error_description);
    }
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    }, (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return res.redirect('/auth?error=auth_error');
      }
      
      if (!user) {
        console.error('Authentication failed:', info);
        return res.redirect('/auth?error=no_user');
      }
      
      // User successfully authenticated, log them in
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.redirect('/auth?error=login_error');
        }
        
        console.log('User successfully authenticated:', user.id);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `http://${req.hostname}`,
        }).href
      );
    });
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  const userData = {
    id: claims["sub"],
    username: claims["username"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    bio: claims["bio"],
    profileImageUrl: claims["profile_image_url"],
    isPublic: true, // Default to public
  };
  
  return await storage.upsertUser(userData);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};