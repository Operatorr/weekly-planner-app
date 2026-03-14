import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  hydrateQueryCache,
  subscribeCacheWriter,
} from "@/lib/query-cache-persist";

/**
 * Hydrates React Query cache from IndexedDB on mount,
 * then subscribes to write cache updates back to IndexedDB.
 * Renders nothing.
 */
export function CacheHydrator() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    hydrateQueryCache(queryClient, userId);
    const unsubscribe = subscribeCacheWriter(queryClient, userId);

    return unsubscribe;
  }, [userId, queryClient]);

  return null;
}
