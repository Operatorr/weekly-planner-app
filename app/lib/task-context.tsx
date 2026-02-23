import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Task, ChecklistItem } from "@/lib/types";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function startOfWeekStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function endOfWeekStr(): string {
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

function weekdayOffset(dayOfWeek: number): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + diff + dayOfWeek);
  return mon.toISOString().split("T")[0];
}

// ── Date utilities (exported for components) ─────────────────────

const today = todayStr();

export function isToday(dateStr: string): boolean {
  return dateStr === today;
}

export function isPast(dateStr: string): boolean {
  return dateStr < today;
}

export function isFuture(dateStr: string): boolean {
  return dateStr > today;
}

export function isThisWeek(dateStr: string): boolean {
  return dateStr >= startOfWeekStr() && dateStr <= endOfWeekStr();
}

export function isBeyondThisWeek(dateStr: string): boolean {
  return dateStr > endOfWeekStr();
}

export function getWeekDays(): { label: string; date: string; isToday: boolean }[] {
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
  if (isToday(dateStr)) return "Today";
  if (dateStr === dateOffset(-1)) return "Yesterday";
  if (dateStr === dateOffset(1)) return "Tomorrow";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ── Mock seed data ──────────────────────────────────────────────

const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    user_id: "mock",
    project_id: "personal",
    title: "Research best journaling apps for inspiration",
    description: "Look at Day One, Notion, Obsidian for design patterns",
    status: "active",
    due_date: null,
    sort_order: 1,
    created_at: dateOffset(-3),
    updated_at: dateOffset(-3),
    completed_at: null,
  },
  {
    id: "t2",
    user_id: "mock",
    project_id: "personal",
    title: "Organize bookmarks into folders",
    description: "",
    status: "active",
    due_date: null,
    sort_order: 2,
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2),
    completed_at: null,
  },
  {
    id: "t3",
    user_id: "mock",
    project_id: "personal",
    title: "Update portfolio website bio",
    description: "Rewrite the about section to be more concise",
    status: "active",
    due_date: null,
    sort_order: 3,
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1),
    completed_at: null,
  },
  {
    id: "t4",
    user_id: "mock",
    project_id: "personal",
    title: "Reply to Sarah's email about dinner plans",
    description: "",
    status: "active",
    due_date: dateOffset(-2),
    sort_order: 4,
    created_at: dateOffset(-5),
    updated_at: dateOffset(-5),
    completed_at: null,
  },
  {
    id: "t5",
    user_id: "mock",
    project_id: "personal",
    title: "Review quarterly goals and progress",
    description: "Go through each goal and mark status. Adjust timelines if needed.",
    status: "active",
    due_date: today,
    sort_order: 5,
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1),
    completed_at: null,
  },
  {
    id: "t6",
    user_id: "mock",
    project_id: "personal",
    title: "Buy groceries for the week",
    description: "",
    status: "active",
    due_date: today,
    sort_order: 6,
    created_at: today,
    updated_at: today,
    completed_at: null,
  },
  {
    id: "t7",
    user_id: "mock",
    project_id: "personal",
    title: "30 minutes meditation practice",
    description: "",
    status: "completed",
    due_date: today,
    sort_order: 7,
    created_at: dateOffset(-1),
    updated_at: today,
    completed_at: today,
  },
  {
    id: "t8",
    user_id: "mock",
    project_id: "personal",
    title: "Call dentist for appointment",
    description: "",
    status: "active",
    due_date: weekdayOffset(2),
    sort_order: 8,
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1),
    completed_at: null,
  },
  {
    id: "t9",
    user_id: "mock",
    project_id: "personal",
    title: "Prepare presentation slides",
    description: "For the team sync on Friday. Keep it minimal — 8 slides max.",
    status: "active",
    due_date: weekdayOffset(3),
    sort_order: 9,
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2),
    completed_at: null,
  },
  {
    id: "t10",
    user_id: "mock",
    project_id: "personal",
    title: "Friday evening yoga class",
    description: "",
    status: "active",
    due_date: weekdayOffset(4),
    sort_order: 10,
    created_at: dateOffset(-3),
    updated_at: dateOffset(-3),
    completed_at: null,
  },
  {
    id: "t11",
    user_id: "mock",
    project_id: "personal",
    title: "Weekend hike at Eagle Creek",
    description: "Pack lunch, water, trail map. Leave by 8am.",
    status: "active",
    due_date: weekdayOffset(5),
    sort_order: 11,
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1),
    completed_at: null,
  },
  {
    id: "t12",
    user_id: "mock",
    project_id: "personal",
    title: "Schedule annual health checkup",
    description: "",
    status: "active",
    due_date: dateOffset(10),
    sort_order: 12,
    created_at: dateOffset(-5),
    updated_at: dateOffset(-5),
    completed_at: null,
  },
  {
    id: "t13",
    user_id: "mock",
    project_id: "personal",
    title: "Plan birthday surprise for Alex",
    description: "Book restaurant, order cake, coordinate with friends",
    status: "active",
    due_date: dateOffset(14),
    sort_order: 13,
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2),
    completed_at: null,
  },
  {
    id: "t14",
    user_id: "mock",
    project_id: "personal",
    title: "Renew gym membership",
    description: "",
    status: "active",
    due_date: dateOffset(20),
    sort_order: 14,
    created_at: dateOffset(-3),
    updated_at: dateOffset(-3),
    completed_at: null,
  },
];

const MOCK_CHECKLIST: Record<string, ChecklistItem[]> = {
  t5: [
    { id: "cl1", task_id: "t5", title: "Career goals", is_completed: true, sort_order: 1, created_at: dateOffset(-1) },
    { id: "cl2", task_id: "t5", title: "Health goals", is_completed: false, sort_order: 2, created_at: dateOffset(-1) },
    { id: "cl3", task_id: "t5", title: "Financial goals", is_completed: false, sort_order: 3, created_at: dateOffset(-1) },
    { id: "cl4", task_id: "t5", title: "Personal growth", is_completed: false, sort_order: 4, created_at: dateOffset(-1) },
  ],
  t13: [
    { id: "cl5", task_id: "t13", title: "Book restaurant", is_completed: false, sort_order: 1, created_at: dateOffset(-2) },
    { id: "cl6", task_id: "t13", title: "Order cake", is_completed: false, sort_order: 2, created_at: dateOffset(-2) },
    { id: "cl7", task_id: "t13", title: "Send invites to friends", is_completed: false, sort_order: 3, created_at: dateOffset(-2) },
  ],
};

// ── Context value ───────────────────────────────────────────────

interface TaskContextValue {
  tasks: Task[];
  getChecklist: (taskId: string) => ChecklistItem[];
  createTask: (input: {
    title: string;
    description?: string;
    due_date?: string | null;
    project_id?: string;
    reminder_type?: string;
    reminder_time?: string;
  }) => void;
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
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(MOCK_CHECKLIST);
  const undoRef = useRef<{ type: string; data: unknown } | null>(null);

  const getChecklist = useCallback(
    (taskId: string): ChecklistItem[] => checklists[taskId] || [],
    [checklists]
  );

  const createTask = useCallback(
    (input: {
      title: string;
      description?: string;
      due_date?: string | null;
      project_id?: string;
    }) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: `t${Date.now()}`,
        user_id: "mock",
        project_id: input.project_id || "personal",
        title: input.title,
        description: input.description || "",
        status: "active",
        due_date: input.due_date || null,
        sort_order: 0,
        created_at: now.split("T")[0],
        updated_at: now.split("T")[0],
        completed_at: null,
      };
      setTasks((prev) => [task, ...prev]);
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...updates, updated_at: new Date().toISOString().split("T")[0] }
            : t
        )
      );
    },
    []
  );

  const completeTask = useCallback(
    (id: string) => {
      let completedTask: Task | undefined;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            completedTask = t;
            return {
              ...t,
              status: "completed" as const,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString().split("T")[0],
            };
          }
          return t;
        })
      );

      toast("Task completed", {
        description: completedTask?.title,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === id
                  ? { ...t, status: "active" as const, completed_at: null }
                  : t
              )
            );
          },
        },
      });
    },
    []
  );

  const uncompleteTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "active" as const, completed_at: null }
            : t
        )
      );
    },
    []
  );

  const deleteTask = useCallback(
    (id: string) => {
      let deletedTask: Task | undefined;

      setTasks((prev) => {
        deletedTask = prev.find((t) => t.id === id);
        return prev.filter((t) => t.id !== id);
      });

      toast("Task deleted", {
        description: deletedTask?.title,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            if (deletedTask) {
              setTasks((prev) => [...prev, deletedTask!]);
            }
          },
        },
      });
    },
    []
  );

  const reorderTasks = useCallback(
    (taskIds: string[], newOrders: number[]) => {
      setTasks((prev) =>
        prev.map((t) => {
          const idx = taskIds.indexOf(t.id);
          if (idx >= 0) {
            return { ...t, sort_order: newOrders[idx] };
          }
          return t;
        })
      );
    },
    []
  );

  const addChecklistItem = useCallback(
    (taskId: string, title: string) => {
      const item: ChecklistItem = {
        id: `cl${Date.now()}`,
        task_id: taskId,
        title,
        is_completed: false,
        sort_order: (checklists[taskId]?.length || 0) + 1,
        created_at: new Date().toISOString().split("T")[0],
      };
      setChecklists((prev) => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), item],
      }));
    },
    [checklists]
  );

  const toggleChecklistItem = useCallback(
    (taskId: string, itemId: string) => {
      setChecklists((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).map((item) =>
          item.id === itemId
            ? { ...item, is_completed: !item.is_completed }
            : item
        ),
      }));
    },
    []
  );

  const deleteChecklistItem = useCallback(
    (taskId: string, itemId: string) => {
      setChecklists((prev) => ({
        ...prev,
        [taskId]: (prev[taskId] || []).filter((item) => item.id !== itemId),
      }));
    },
    []
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
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
