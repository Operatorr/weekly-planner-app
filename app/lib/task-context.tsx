import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, ChecklistItem } from "@/lib/types";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useSettings } from "@/lib/settings-context";

// ── Helpers ──────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// Normalize date string to YYYY-MM-DD format (handles both "2026-02-25" and "2026-02-25T00:00:00.000Z")
export function normalizeDate(dateStr: string): string {
  return dateStr.split("T")[0];
}

export function startOfWeekStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export function endOfWeekStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ── Date utilities (exported for components) ─────────────────────

export function isToday(dateStr: string): boolean {
  return normalizeDate(dateStr) === todayStr();
}

export function isPast(dateStr: string): boolean {
  return normalizeDate(dateStr) < todayStr();
}

export function isFuture(dateStr: string): boolean {
  return normalizeDate(dateStr) > todayStr();
}

export function isThisWeek(dateStr: string): boolean {
  const d = normalizeDate(dateStr);
  return d >= startOfWeekStr() && d <= endOfWeekStr();
}

export function isBeyondThisWeek(dateStr: string): boolean {
  return normalizeDate(dateStr) > endOfWeekStr();
}

export function getWeekDays(): { label: string; date: string; isToday: boolean }[] {
  const today = todayStr();
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + diff);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((label, i) => {
    const dd = new Date(mon);
    dd.setDate(dd.getDate() + i);
    const dateStr = dd.toISOString().split("T")[0];
    return { label: `${label} ${dd.getDate()}`, date: dateStr, isToday: dateStr === today };
  });
}

export function getWeekRange(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

export function formatDate(dateStr: string): string {
  const normalized = normalizeDate(dateStr);
  if (isToday(normalized)) return "Today";
  if (normalized === dateOffset(-1)) return "Yesterday";
  if (normalized === dateOffset(1)) return "Tomorrow";
  const d = new Date(normalized + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateLong(dateStr: string): string {
  const normalized = normalizeDate(dateStr);
  const d = new Date(normalized + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ── Context value ───────────────────────────────────────────────

interface TaskContextValue {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  getChecklist: (taskId: string) => ChecklistItem[];
  createTask: (input: {
    title: string;
    description?: string;
    due_date?: string | null;
    project_id?: string | null;
    is_someday?: boolean;
    reminder_type?: string;
    reminder_time?: string;
  }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (taskIds: string[], newOrders: number[]) => void;
  addChecklistItem: (taskId: string, title: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
}

// ── Provider ────────────────────────────────────────────────────

export function TaskProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  // Local checklist cache (fetched on demand per task)
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>({});

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.fetchTasks(token);
    },
  });

  // ── Create Task ─────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      due_date?: string | null;
      project_id?: string | null;
      is_someday?: boolean;
      sort_order?: number;
      optimisticId: string;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.createTask(token, {
        title: input.title,
        description: input.description,
        project_id: input.project_id,
        due_date: input.due_date,
        is_someday: input.is_someday,
        sort_order: input.sort_order,
      });
    },
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Task[]>(["tasks"]) || [];

      // Calculate sort_order based on position setting
      const addToTop = settings.newTaskPosition === "top";
      const sortOrder = addToTop
        ? previous.reduce((min, t) => Math.min(min, t.sort_order), 0) - 1
        : previous.reduce((max, t) => Math.max(max, t.sort_order), 0) + 1;

      // Store sort_order on input so mutationFn can send it to the server
      input.sort_order = sortOrder;

      const optimisticTask: Task = {
        id: input.optimisticId,
        user_id: "",
        project_id: input.project_id || "",
        title: input.title,
        description: input.description || "",
        status: "active",
        due_date: input.due_date || null,
        is_someday: input.is_someday || false,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      };

      queryClient.setQueryData<Task[]>(["tasks"], addToTop
        ? [optimisticTask, ...previous]
        : [...previous, optimisticTask]
      );

      return { previous, optimisticId: input.optimisticId };
    },
    onSuccess: (newTask, _input, context) => {
      // Replace optimistic task with real task from server
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === context?.optimisticId ? newTask : t))
      );
    },
    onError: (error: Error, _input, context) => {
      // Rollback to previous state
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error("Failed to create task", { description: error.message });
    },
  });

  const createTask = useCallback(
    (input: {
      title: string;
      description?: string;
      due_date?: string | null;
      project_id?: string | null;
      is_someday?: boolean;
    }): Promise<Task> => {
      const optimisticId = `optimistic-${Date.now()}`;
      return new Promise((resolve, reject) => {
        createMutation.mutate(
          { ...input, optimisticId },
          {
            onSuccess: (data) => resolve(data),
            onError: (error) => reject(error),
          }
        );
      });
    },
    [createMutation]
  );

  // ── Update Task ─────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.updateTask(token, id, {
        title: updates.title,
        description: updates.description,
        project_id: updates.project_id,
        due_date: updates.due_date,
        is_someday: updates.is_someday,
        sort_order: updates.sort_order,
      });
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error("Failed to update task", { description: error.message });
    },
  });

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      if (id.startsWith("optimistic-")) return;
      updateMutation.mutate({ id, updates });
    },
    [updateMutation]
  );

  // ── Complete Task ───────────────────────────────────────────────

  const completeMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.completeTask(token, id, completed);
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) =>
          t.id === id
            ? {
                ...t,
                status: completed ? "completed" : "active",
                completed_at: completed ? new Date().toISOString() : null,
              }
            : t
        )
      );
      return { previous };
    },
    onSuccess: (updatedTask, { id }) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === id ? updatedTask : t))
      );
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error("Failed to update task", { description: error.message });
    },
  });

  const completeTask = useCallback(
    (id: string) => {
      if (id.startsWith("optimistic-")) return;
      const task = tasks.find((t) => t.id === id);
      completeMutation.mutate({ id, completed: true });

      toast("Task completed", {
        description: task?.title,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            completeMutation.mutate({ id, completed: false });
          },
        },
      });
    },
    [completeMutation, tasks]
  );

  const uncompleteTask = useCallback(
    (id: string) => {
      if (id.startsWith("optimistic-")) return;
      completeMutation.mutate({ id, completed: false });
    },
    [completeMutation]
  );

  // ── Delete Task ─────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.deleteTask(token, id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      const deletedTask = previous?.find((t) => t.id === id);
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { previous, deletedTask };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error("Failed to delete task", { description: error.message });
    },
  });

  const deleteTask = useCallback(
    (id: string) => {
      if (id.startsWith("optimistic-")) return;
      const task = tasks.find((t) => t.id === id);
      deleteMutation.mutate(id);

      toast("Task deleted", {
        description: task?.title,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            // Re-create the task (best effort undo)
            if (task) {
              createMutation.mutate({
                title: task.title,
                description: task.description || undefined,
                due_date: task.due_date,
                project_id: task.project_id,
                optimisticId: crypto.randomUUID(),
              });
            }
          },
        },
      });
    },
    [deleteMutation, createMutation, tasks]
  );

  // ── Reorder Tasks ───────────────────────────────────────────────

  const reorderMutation = useMutation({
    mutationFn: async (reorderData: { id: string; sort_order: number }[]) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.reorderTasks(token, reorderData);
    },
    onMutate: async (reorderData) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);

      const orderMap = new Map(reorderData.map((r) => [r.id, r.sort_order]));
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => {
          const newOrder = orderMap.get(t.id);
          return newOrder !== undefined ? { ...t, sort_order: newOrder } : t;
        })
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
      toast.error("Failed to reorder tasks", { description: error.message });
    },
  });

  const reorderTasks = useCallback(
    (taskIds: string[], newOrders: number[]) => {
      const reorderData = taskIds.map((id, i) => ({ id, sort_order: newOrders[i] }));
      reorderMutation.mutate(reorderData);
    },
    [reorderMutation]
  );

  // ── Checklist Operations ────────────────────────────────────────

  const getChecklist = useCallback(
    (taskId: string): ChecklistItem[] => checklists[taskId] || [],
    [checklists]
  );

  const addChecklistMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string; optimisticId: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.addChecklistItem(token, { task_id: taskId, title });
    },
    onMutate: async ({ taskId, title, optimisticId }) => {
      const previous = checklists[taskId] || [];
      const optimisticItem: ChecklistItem = {
        id: optimisticId,
        task_id: taskId,
        title,
        is_completed: false,
        sort_order: previous.length,
        created_at: new Date().toISOString(),
      };
      setChecklists((prev) => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), optimisticItem],
      }));
      return { taskId, previous, optimisticId };
    },
    onSuccess: (newItem, _vars, context) => {
      // Replace optimistic item with real item from server
      if (context?.taskId && context?.optimisticId) {
        setChecklists((prev) => ({
          ...prev,
          [context.taskId]: (prev[context.taskId] || []).map((item) =>
            item.id === context.optimisticId ? newItem : item
          ),
        }));
      }
    },
    onError: (error: Error, _vars, context) => {
      // Rollback to previous state
      if (context?.taskId) {
        setChecklists((prev) => ({
          ...prev,
          [context.taskId]: context.previous || [],
        }));
      }
      toast.error("Failed to add checklist item", { description: error.message });
    },
  });

  const addChecklistItem = useCallback(
    (taskId: string, title: string) => {
      if (taskId.startsWith("optimistic-")) return;
      const optimisticId = `optimistic-${Date.now()}`;
      addChecklistMutation.mutate({ taskId, title, optimisticId });
    },
    [addChecklistMutation]
  );

  const updateChecklistMutation = useMutation({
    mutationFn: async ({
      taskId,
      itemId,
      is_completed,
    }: {
      taskId: string;
      itemId: string;
      is_completed: boolean;
    }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.updateChecklistItem(token, itemId, { is_completed });
    },
    onMutate: async ({ taskId, itemId, is_completed }) => {
      const previous = checklists[taskId];
      setChecklists((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).map((item) =>
          item.id === itemId ? { ...item, is_completed } : item
        ),
      }));
      return { taskId, previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous && context?.taskId) {
        setChecklists((prev) => ({
          ...prev,
          [context.taskId]: context.previous,
        }));
      }
      toast.error("Failed to update checklist item", { description: error.message });
    },
  });

  const toggleChecklistItem = useCallback(
    (taskId: string, itemId: string) => {
      const item = checklists[taskId]?.find((i) => i.id === itemId);
      if (item) {
        updateChecklistMutation.mutate({
          taskId,
          itemId,
          is_completed: !item.is_completed,
        });
      }
    },
    [updateChecklistMutation, checklists]
  );

  const deleteChecklistMutation = useMutation({
    mutationFn: async ({ taskId, itemId }: { taskId: string; itemId: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      await api.deleteChecklistItem(token, itemId);
      return { taskId, itemId };
    },
    onMutate: async ({ taskId, itemId }) => {
      const previous = checklists[taskId];
      setChecklists((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).filter((item) => item.id !== itemId),
      }));
      return { taskId, previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous && context?.taskId) {
        setChecklists((prev) => ({
          ...prev,
          [context.taskId]: context.previous,
        }));
      }
      toast.error("Failed to delete checklist item", { description: error.message });
    },
  });

  const deleteChecklistItem = useCallback(
    (taskId: string, itemId: string) => {
      deleteChecklistMutation.mutate({ taskId, itemId });
    },
    [deleteChecklistMutation]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error: error as Error | null,
        getChecklist,
        createTask,
        updateTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        reorderTasks,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
