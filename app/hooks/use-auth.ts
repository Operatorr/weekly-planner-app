import { useAuth as useClerkAuth } from "@clerk/react";

export function useAuth(): { isSignedIn: boolean } {
  const { isSignedIn } = useClerkAuth();
  return { isSignedIn: !!isSignedIn };
}
