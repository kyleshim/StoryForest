import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import DebugPage from "@/pages/debug-page";

// Simple version without Clerk for testing thumbnails
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <DebugPage />
    <Toaster />
  </QueryClientProvider>
);