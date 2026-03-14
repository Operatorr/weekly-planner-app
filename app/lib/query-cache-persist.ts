import { get, set, del, keys, createStore } from "idb-keyval";
import type { QueryClient } from "@tanstack/react-query";

const cacheStore = createStore("domarrow-cache", "query-cache");

// Query keys we persist to IndexedDB
const PERSISTED_KEYS = ['["tasks"]', '["projects"]'];

function cacheKey(userId: string, queryKey: string): string {
  return `domarrow:${userId}:${queryKey}`;
}

function shouldPersist(queryKey: readonly unknown[]): boolean {
  const serialized = JSON.stringify(queryKey);
  if (PERSISTED_KEYS.includes(serialized)) return true;
  // Persist checklist queries: ["checklist", "list", taskId]
  return queryKey[0] === "checklist" && queryKey[1] === "list";
}

function isOptimisticId(id: unknown): boolean {
  return (
    typeof id === "string" &&
    (id.startsWith("optimistic-") || id.startsWith("temp-"))
  );
}

function filterOptimistic<T extends { id: unknown }>(data: T[]): T[] {
  return data.filter((item) => !isOptimisticId(item.id));
}

/**
 * Hydrate React Query cache from IndexedDB for the given user.
 * Returns silently if IndexedDB is unavailable.
 */
export async function hydrateQueryCache(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  try {
    const allKeys = await keys<string>(cacheStore);
    const prefix = `domarrow:${userId}:`;
    const userKeys = allKeys.filter((k) => k.startsWith(prefix));

    await Promise.all(
      userKeys.map(async (key) => {
        try {
          const data = await get(key, cacheStore);
          if (data === undefined) return;
          const queryKeyStr = key.slice(prefix.length);
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData(queryKey, data);
        } catch {
          // Skip malformed entries
        }
      }),
    );
  } catch {
    // IndexedDB unavailable — degrade gracefully
  }
}

/**
 * Subscribe to query cache updates and persist to IndexedDB.
 * Returns an unsubscribe function.
 */
export function subscribeCacheWriter(
  queryClient: QueryClient,
  userId: string,
): () => void {
  const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" || event.action.type !== "success") return;

    const queryKey = event.query.queryKey;
    if (!shouldPersist(queryKey)) return;

    const serialized = JSON.stringify(queryKey);
    const key = cacheKey(userId, serialized);

    // Debounce writes per query key
    const existing = pendingWrites.get(key);
    if (existing) clearTimeout(existing);

    pendingWrites.set(
      key,
      setTimeout(() => {
        pendingWrites.delete(key);
        const data = event.query.state.data;
        if (data == null) return;

        // Filter out optimistic entries before persisting
        const cleaned = Array.isArray(data) ? filterOptimistic(data) : data;
        set(key, cleaned, cacheStore).catch(() => {});
      }, 300),
    );
  });

  return () => {
    for (const timer of pendingWrites.values()) clearTimeout(timer);
    pendingWrites.clear();
    unsubscribe();
  };
}

/**
 * Clear all persisted cache entries for a user.
 */
export async function clearPersistedCache(userId: string): Promise<void> {
  try {
    const allKeys = await keys<string>(cacheStore);
    const prefix = `domarrow:${userId}:`;
    await Promise.all(
      allKeys
        .filter((k) => k.startsWith(prefix))
        .map((k) => del(k, cacheStore)),
    );
  } catch {
    // IndexedDB unavailable
  }
}
