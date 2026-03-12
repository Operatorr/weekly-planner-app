import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/types";

// ── Keys ─────────────────────────────────────────────────────────

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...taskKeys.lists(), filters] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};

// ── Fetchers ─────────────────────────────────────────────────────

async function fetchTasks(
  params: Record<string, string> = {},
): Promise<Task[]> {
  const search = new URLSearchParams(params);
  const res = await fetch(`/api/tasks?${search}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function fetchTask(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

// ── Date helpers ─────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function endOfWeekStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day; // days until Sunday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function startOfWeekStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// ── Query hooks ──────────────────────────────────────────────────

/** Undated + overdue + today tasks */
export function useUndatedAndTodayTasks(projectId?: string) {
  return useQuery({
    queryKey: taskKeys.list({ view: "today", projectId: projectId ?? "" }),
    queryFn: () =>
      fetchTasks({
        view: "today",
        ...(projectId ? { project_id: projectId } : {}),
      }),
    select: (tasks: Task[]) => {
      const today = todayStr();
      const undated: Task[] = [];
      const overdue: Task[] = [];
      const todayTasks: Task[] = [];

      for (const t of tasks) {
        if (t.status === "completed") continue;
        if (!t.due_date) {
          undated.push(t);
        } else if (t.due_date < today) {
          overdue.push(t);
        } else if (t.due_date === today) {
          todayTasks.push(t);
        }
      }
      return { undated, overdue, today: todayTasks };
    },
  });
}

/** Tasks for this week grouped by day */
export function useWeeklyTasks(projectId?: string) {
  return useQuery({
    queryKey: taskKeys.list({ view: "week", projectId: projectId ?? "" }),
    queryFn: () =>
      fetchTasks({
        view: "week",
        ...(projectId ? { project_id: projectId } : {}),
      }),
    select: (tasks: Task[]) => {
      const today = todayStr();
      const grouped: Record<string, Task[]> = {};

      for (const t of tasks) {
        if (!t.due_date || t.due_date <= today) continue;
        const day = t.due_date;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(t);
      }

      // Return sorted by date
      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dateTasks]) => ({
          date,
          tasks: dateTasks.sort((a, b) => a.sort_order - b.sort_order),
        }));
    },
  });
}

/** Future tasks (beyond this week) grouped by week */
export function useFutureTasks(projectId?: string) {
  return useQuery({
    queryKey: taskKeys.list({ view: "future", projectId: projectId ?? "" }),
    queryFn: () =>
      fetchTasks({
        view: "future",
        ...(projectId ? { project_id: projectId } : {}),
      }),
    select: (tasks: Task[]) => {
      const grouped: Record<string, Task[]> = {};

      for (const t of tasks) {
        if (!t.due_date) continue;
        // Group by ISO week start (Monday)
        const d = new Date(t.due_date.split("T")[0] + "T12:00:00");
        if (isNaN(d.getTime())) continue;
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const mon = new Date(d);
        mon.setDate(mon.getDate() + diff);
        const weekKey = mon.toISOString().split("T")[0];

        if (!grouped[weekKey]) grouped[weekKey] = [];
        grouped[weekKey].push(t);
      }

      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, weekTasks]) => ({
          weekStart,
          tasks: weekTasks.sort((a, b) => a.sort_order - b.sort_order),
        }));
    },
  });
}

/** All tasks for a given project */
export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.list({ project_id: projectId }),
    queryFn: () => fetchTasks({ project_id: projectId }),
  });
}

/** Single task detail */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId,
  });
}

// ── Mutations with optimistic updates ────────────────────────────

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateTaskInput & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json() as Promise<Task>;
    },
    // Optimistic update
    onMutate: async ({ id, ...input }) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = qc.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      qc.setQueriesData<Task[]>(
        { queryKey: taskKeys.lists() },
        (old) =>
          old?.map((t) => (t.id === id ? { ...t, ...input, updated_at: new Date().toISOString() } : t)),
      );

      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = qc.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      qc.setQueriesData<Task[]>(
        { queryKey: taskKeys.lists() },
        (old) => old?.filter((t) => t.id !== id),
      );

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/** Quick toggle task completion with optimistic update */
export function useToggleTaskStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "completed";
    }) => {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: status === "completed" }),
      });
      if (!res.ok) throw new Error("Failed to toggle task");
      return res.json() as Promise<Task>;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = qc.getQueriesData<Task[]>({
        queryKey: taskKeys.lists(),
      });

      qc.setQueriesData<Task[]>(
        { queryKey: taskKeys.lists() },
        (old) =>
          old?.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  completed_at:
                    status === "completed"
                      ? new Date().toISOString()
                      : null,
                  updated_at: new Date().toISOString(),
                }
              : t,
          ),
      );

      return { previousLists };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
