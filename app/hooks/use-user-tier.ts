import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { UserTier } from "@/lib/types";

// ── Keys ─────────────────────────────────────────────────────────

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// ── Types ────────────────────────────────────────────────────────

interface UserMeResponse {
  tier: UserTier;
}

// ── Query hooks ──────────────────────────────────────────────────

export function useUserTier() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async (): Promise<UserTier> => {
      const token = await getToken();
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data: UserMeResponse = await res.json();
      return data.tier;
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
