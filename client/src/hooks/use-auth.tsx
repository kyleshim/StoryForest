import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, LoginUser, RegisterUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser, useClerk } from "@clerk/clerk-react";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: UseMutationResult<void, Error, void>;
  updatePrivacyMutation: UseMutationResult<SelectUser, Error, {isPublic: boolean}>;

};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Map Clerk user to our app's user format
  const mappedUser: SelectUser | null = user ? {
    id: user.id,
    username: user.username || '',
    firstName: user.firstName || '',
    email: user.emailAddresses[0]?.emailAddress || '',
    isPublic: true, // Default value since Clerk doesn't have this concept
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.createdAt)
  } : null;


  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: {isPublic: boolean}) => {
      const res = await apiRequest("PATCH", "/api/user/privacy", data);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Privacy settings updated",
        description: user.isPublic 
          ? "Your library is now public." 
          : "Your library is now private.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: mappedUser,
        isLoading: !isLoaded,
        error: null,
        logoutMutation,
        updatePrivacyMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}