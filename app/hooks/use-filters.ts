import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import * as api from "@/lib/api";
import { toast } from "sonner";
import type { FilterConfig, SavedFilter } from "@/components/app/filter-panel";

// ── Conversion helpers ──────────────────────────────────────────

interface ApiFilterConfig {
  status?: string;
  project_id?: string | null;
  date_range?: string;
  date_from?: string | null;
  date_to?: string | null;
  has_due_date?: boolean;
  has_reminder?: boolean;
}

interface ApiFilterRow {
  id: string;
  name: string;
  config: ApiFilterConfig;
  created_at: string;
}

function toApiConfig(config: FilterConfig): ApiFilterConfig {
  const apiConfig: ApiFilterConfig = {};

  if (config.status && config.status !== "all") {
    apiConfig.status = config.status;
  }
  if (config.projectId) {
    apiConfig.project_id = config.projectId;
  }
  if (config.dateRange && config.dateRange !== "all") {
    apiConfig.date_range = config.dateRange;
  }

  return apiConfig;
}

function fromApiRow(row: ApiFilterRow): SavedFilter {
  const config: FilterConfig = {
    status: (row.config.status as FilterConfig["status"]) || "all",
    projectId: row.config.project_id || undefined,
    dateRange: (row.config.date_range as FilterConfig["dateRange"]) || "all",
  };

  return {
    id: row.id,
    name: row.name,
    config,
    createdAt: row.created_at,
  };
}

// ── Hooks ───────────────────────────────────────────────────────

export function useFilters() {
  const { getToken } = useAuth();

  return useQuery<SavedFilter[]>({
    queryKey: ["filters"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const rows = await api.fetchFilters(token);
      return (rows as unknown as ApiFilterRow[]).map(fromApiRow);
    },
    staleTime: 30_000,
  });
}

export function useCreateFilter() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, config }: { name: string; config: FilterConfig }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.createFilter(token, {
        name,
        config: toApiConfig(config) as Record<string, unknown>,
      });
    },
    onMutate: async ({ name, config }) => {
      await queryClient.cancelQueries({ queryKey: ["filters"] });
      const previous = queryClient.getQueryData<SavedFilter[]>(["filters"]);

      const optimistic: SavedFilter = {
        id: `temp-${Date.now()}`,
        name,
        config,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<SavedFilter[]>(["filters"], (old = []) => [
        ...old,
        optimistic,
      ]);

      return { previous };
    },
    onSuccess: (newRow) => {
      const newFilter = fromApiRow(newRow as unknown as ApiFilterRow);
      queryClient.setQueryData<SavedFilter[]>(["filters"], (old = []) =>
        old.map((f) => (f.id.startsWith("temp-") ? newFilter : f))
      );
      toast.success("Filter saved");
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["filters"], context.previous);
      }
      if (err.message.includes("Filter limit")) {
        // Handled by UI upgrade prompt
        return;
      }
      toast.error("Failed to save filter", { description: err.message });
    },
  });
}

export function useUpdateFilter() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      config,
    }: {
      id: string;
      name?: string;
      config?: FilterConfig;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.updateFilter(token, id, {
        ...(name !== undefined && { name }),
        ...(config !== undefined && { config: toApiConfig(config) as Record<string, unknown> }),
      });
    },
    onMutate: async ({ id, name, config }) => {
      await queryClient.cancelQueries({ queryKey: ["filters"] });
      const previous = queryClient.getQueryData<SavedFilter[]>(["filters"]);

      queryClient.setQueryData<SavedFilter[]>(["filters"], (old = []) =>
        old.map((f) =>
          f.id === id
            ? { ...f, ...(name !== undefined && { name }), ...(config !== undefined && { config }) }
            : f
        )
      );

      return { previous };
    },
    onSuccess: (updatedRow) => {
      const updated = fromApiRow(updatedRow as unknown as ApiFilterRow);
      queryClient.setQueryData<SavedFilter[]>(["filters"], (old = []) =>
        old.map((f) => (f.id === updated.id ? updated : f))
      );
      toast.success("Filter updated");
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["filters"], context.previous);
      }
      toast.error("Failed to update filter", { description: err.message });
    },
  });
}

export function useDeleteFilter() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.deleteFilter(token, id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["filters"] });
      const previous = queryClient.getQueryData<SavedFilter[]>(["filters"]);

      queryClient.setQueryData<SavedFilter[]>(["filters"], (old = []) =>
        old.filter((f) => f.id !== id)
      );

      return { previous };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["filters"], context.previous);
      }
      toast.error("Failed to delete filter", { description: err.message });
    },
  });
}
