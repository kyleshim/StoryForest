
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import LibraryPage from "@/pages/library-page";
import WishlistPage from "@/pages/wishlist-page";
import DiscoverPage from "@/pages/discover-page";
import ExplorePage from "@/pages/explore-page";
import ProfilePage from "@/pages/profile-page";
import AuthPage from "@/pages/auth-page";
import DebugPage from "@/pages/debug-page";
import LandingPage from "@/pages/landing-page";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

function Router() {
  return (
    <Switch>
      <Route path="/debug">
        <DebugPage />
      </Route>
      <Route path="/auth">
        <SignedOut>
          <AuthPage />
        </SignedOut>
        <SignedIn>
          <RedirectToSignIn />
        </SignedIn>
      </Route>
      <Route path="/">
        <SignedIn>
          <HomePage />
        </SignedIn>
        <SignedOut>
          <LandingPage />
        </SignedOut>
      </Route>
      <Route path="/library/:childId">
        <SignedIn>
          <LibraryPage />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>
      <Route path="/wishlist/:childId">
        <SignedIn>
          <WishlistPage />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>
      <Route path="/discover/:childId">
        <SignedIn>
          <DiscoverPage />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>
      <Route path="/explore">
        <SignedIn>
          <ExplorePage />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>
      <Route path="/profile">
        <SignedIn>
          <ProfilePage />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="story-forest-theme">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
