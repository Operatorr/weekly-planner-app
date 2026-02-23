import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ChecklistItem,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "@/lib/types";

// ── Keys ─────────────────────────────────────────────────────────

export const checklistKeys = {
  all: ["checklist"] as const,
  list: (taskId: string) => [...checklistKeys.all, "list", taskId] as const,
};

// ── Fetchers ─────────────────────────────────────────────────────

async function fetchChecklist(taskId: string): Promise<ChecklistItem[]> {
  const res = await fetch(`/api/checklist?task_id=${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch checklist");
  return res.json();
}

// ── Query hooks ──────────────────────────────────────────────────

export function useChecklist(taskId: string) {
  return useQuery({
    queryKey: checklistKeys.list(taskId),
    queryFn: () => fetchChecklist(taskId),
    enabled: !!taskId,
  });
}

// ── Mutations ────────────────────────────────────────────────────

export function useCreateChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChecklistItemInput) => {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create checklist item");
      return res.json() as Promise<ChecklistItem>;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: checklistKeys.list(variables.task_id),
      });
    },
  });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      taskId,
      ...input
    }: UpdateChecklistItemInput & { id: string; taskId: string }) => {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update checklist item");
      return res.json() as Promise<ChecklistItem>;
    },
    // Optimistic toggle
    onMutate: async ({ id, taskId, ...input }) => {
      const key = checklistKeys.list(taskId);
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<ChecklistItem[]>(key);

      qc.setQueryData<ChecklistItem[]>(key, (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, ...input } : item,
        ),
      );

      return { previous, key };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({
        queryKey: checklistKeys.list(variables.taskId),
      });
    },
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      taskId,
    }: {
      id: string;
      taskId: string;
    }) => {
      const res = await fetch(`/api/checklist/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete checklist item");
    },
    onMutate: async ({ id, taskId }) => {
      const key = checklistKeys.list(taskId);
      await qc.cancelQueries({ queryKey: key });

      const previous = qc.getQueryData<ChecklistItem[]>(key);

      qc.setQueryData<ChecklistItem[]>(key, (old) =>
        old?.filter((item) => item.id !== id),
      );

      return { previous, key };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(context.key, context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({
        queryKey: checklistKeys.list(variables.taskId),
      });
    },
  });
}
