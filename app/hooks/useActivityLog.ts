import { useQuery } from "@tanstack/react-query";
import type { ActivityEntry, UserTier } from "@/lib/types";

// ── Keys ─────────────────────────────────────────────────────────

export const activityKeys = {
  all: ["activity"] as const,
  list: (limit: number) => [...activityKeys.all, "list", limit] as const,
};

// ── Types ────────────────────────────────────────────────────────

interface ActivityLogResponse {
  entries: ActivityEntry[];
  tier: UserTier;
  cutoff_date: string | null;
}

// ── Fetchers ─────────────────────────────────────────────────────

async function fetchActivityLog(limit: number): Promise<ActivityLogResponse> {
  const res = await fetch(`/api/activity?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch activity log");
  return res.json();
}

// ── Query hooks ──────────────────────────────────────────────────

export function useActivityLog(limit = 50) {
  return useQuery({
    queryKey: activityKeys.list(limit),
    queryFn: () => fetchActivityLog(limit),
    select: (data) => ({
      entries: data.entries,
      tier: data.tier,
      cutoffDate: data.cutoff_date,
    }),
  });
}
