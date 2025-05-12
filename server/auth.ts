import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { InsertUserPreferences } from "@shared/schema";
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string | null;
        sessionId: string | null;
        getToken: () => Promise<string | null>;
      }
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "storyforest-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  
  // Use Clerk's middleware to require auth for API routes
  app.use("/api", ClerkExpressRequireAuth({}));
  
  // Create or update user preferences when a user profile is updated
  app.post("/api/webhook/clerk", async (req, res) => {
    // This should be properly secured with webhook signatures in production
    try {
      const evt = req.body;
      
      // Handle user creation or update
      if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const clerkId = evt.data.id;
        const isPublic = true; // Default
        
        // Create or update user preferences
        await storage.updateUserPreferences({
          clerkId,
          isPublic
        });
        
        res.status(200).json({ success: true });
      } else {
        res.status(200).json({ received: true });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
  
  // Update privacy settings
  app.put("/api/user/privacy", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const clerkId = req.auth.userId;
    const isPublic = req.body.isPublic;
    
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ error: "Invalid privacy setting" });
    }
    
    try {
      const updatedPrefs = await storage.updateUserPreferences({
        clerkId,
        isPublic
      });
      
      res.json({ success: true, isPublic: updatedPrefs.isPublic });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ error: 'Failed to update privacy settings' });
    }
  });
  
  // Helper middleware to ensure user preferences exist
  app.use("/api", async (req, res, next) => {
    try {
      if (req.auth?.userId) {
        // Check if user has preferences, create if not
        const prefs = await storage.getUserPreferences(req.auth.userId);
        
        if (!prefs) {
          // Create default preferences for this user
          await storage.createUserPreferences({
            clerkId: req.auth.userId,
            isPublic: true // Default to public
          });
        }
      }
      next();
    } catch (error) {
      console.error("Error in user preferences middleware:", error);
      next();
    }
  });
  
  // Get current user information
  app.get("/api/user", async (req, res) => {
    if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
      const clerkId = req.auth.userId;
      
      // Get user from Clerk
      const user = await clerkClient.users.getUser(clerkId);
      
      // Get user preferences from our DB
      const prefs = await storage.getUserPreferences(clerkId);
      
      res.json({
        id: user.id,
        username: user.username || user.id.substring(0, 8),
        firstName: user.firstName,
        email: user.emailAddresses[0]?.emailAddress,
        profileImageUrl: user.imageUrl,
        isPublic: prefs?.isPublic ?? true,
        createdAt: user.createdAt,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user information" });
    }
  });
}