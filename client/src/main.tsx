import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import HomePage from "@/pages/home-page";

// Temporarily bypassing Clerk to show the new UI design
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="story-forest-theme">
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <HomePage />
        <Toaster />
      </QueryClientProvider>
    </TooltipProvider>
  </ThemeProvider>
);