import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export function useAuth(): { isSignedIn: boolean } {
  const { isSignedIn } = useClerkAuth();
  return { isSignedIn: !!isSignedIn };
}
