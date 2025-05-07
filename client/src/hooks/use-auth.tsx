import { useContext } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { User as SelectUser } from "@shared/schema";

export function useAuth() {
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

  return {
    user: mappedUser,
    isLoading: !isLoaded,
    error: null,
    signOut
  };
}