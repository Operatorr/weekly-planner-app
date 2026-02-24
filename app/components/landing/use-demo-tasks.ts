import { useState, useCallback, useMemo } from "react";

// ── Types ───────────────────────────────────────────────────────

export type DemoView = "today" | "upcoming" | "someday";

export interface DemoTask {
  id: string;
  title: string;
  status: "active" | "completed";
  due_date: string | null;
  is_someday: boolean;
  project_id: string;
  sort_order: number;
}

export interface DemoProject {
  id: string;
  name: string;
  color: string;
}

// ── Date helpers ────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
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

// Exported for components
export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export function isPast(dateStr: string): boolean {
  return dateStr < todayStr();
}

export function isThisWeek(dateStr: string): boolean {
  return dateStr >= startOfWeekStr() && dateStr <= endOfWeekStr();
}

export function getWeekDays(): { label: string; shortLabel: string; date: string; isToday: boolean }[] {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + diff);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const shortDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today = todayStr();
  return days.map((label, i) => {
    const dd = new Date(mon);
    dd.setDate(dd.getDate() + i);
    const dateStr = dd.toISOString().split("T")[0];
    return {
      label: `${label} ${dd.getDate()}`,
      shortLabel: shortDays[i],
      date: dateStr,
      isToday: dateStr === today,
    };
  });
}

// ── Demo projects ───────────────────────────────────────────────

export const DEMO_PROJECTS: DemoProject[] = [
  { id: "personal", name: "Personal", color: "#D4644A" },
  { id: "work", name: "Work", color: "#6B9BC3" },
];

// ── Seed data ───────────────────────────────────────────────────

function createSeedData(): DemoTask[] {
  const today = todayStr();

  return [
    // Today tasks (Personal) - with due date
    {
      id: "d1",
      title: "Review quarterly goals",
      status: "active",
      due_date: today,
      is_someday: false,
      project_id: "personal",
      sort_order: 1,
    },
    {
      id: "d2",
      title: "Buy groceries for the week",
      status: "active",
      due_date: today,
      is_someday: false,
      project_id: "personal",
      sort_order: 2,
    },
    {
      id: "d3",
      title: "30 minutes meditation",
      status: "completed",
      due_date: today,
      is_someday: false,
      project_id: "personal",
      sort_order: 3,
    },

    // Today tasks (Work) - with due date
    {
      id: "d4",
      title: "Reply to client emails",
      status: "active",
      due_date: today,
      is_someday: false,
      project_id: "work",
      sort_order: 4,
    },

    // Upcoming tasks (this week)
    {
      id: "d5",
      title: "Call dentist for appointment",
      status: "active",
      due_date: weekdayOffset(2), // Wednesday
      is_someday: false,
      project_id: "personal",
      sort_order: 5,
    },
    {
      id: "d6",
      title: "Prepare presentation slides",
      status: "active",
      due_date: weekdayOffset(3), // Thursday
      is_someday: false,
      project_id: "work",
      sort_order: 6,
    },
    {
      id: "d7",
      title: "Friday evening yoga class",
      status: "active",
      due_date: weekdayOffset(4), // Friday
      is_someday: false,
      project_id: "personal",
      sort_order: 7,
    },
    {
      id: "d8",
      title: "Weekend hike at Eagle Creek",
      status: "active",
      due_date: weekdayOffset(5), // Saturday
      is_someday: false,
      project_id: "personal",
      sort_order: 8,
    },

    // Today tasks (no due date, not someday = appears in Today)
    {
      id: "d9",
      title: "Organize bookmarks into folders",
      status: "active",
      due_date: null,
      is_someday: false,
      project_id: "personal",
      sort_order: 9,
    },
    {
      id: "d10",
      title: "Update portfolio website bio",
      status: "active",
      due_date: null,
      is_someday: false,
      project_id: "work",
      sort_order: 10,
    },
    {
      id: "d11",
      title: "Research best journaling apps",
      status: "active",
      due_date: null,
      is_someday: false,
      project_id: "personal",
      sort_order: 11,
    },

    // Someday tasks
    {
      id: "d12",
      title: "Learn Spanish basics",
      status: "active",
      due_date: null,
      is_someday: true,
      project_id: "personal",
      sort_order: 12,
    },
    {
      id: "d13",
      title: "Plan summer vacation to Italy",
      status: "active",
      due_date: null,
      is_someday: true,
      project_id: "personal",
      sort_order: 13,
    },
    {
      id: "d14",
      title: "Write a blog post about productivity",
      status: "active",
      due_date: null,
      is_someday: true,
      project_id: "work",
      sort_order: 14,
    },
  ];
}

// ── Hook ────────────────────────────────────────────────────────

export function useDemoTasks() {
  const [tasks, setTasks] = useState<DemoTask[]>(createSeedData);
  const [activeView, setActiveView] = useState<DemoView>("today");
  const [activeProject, setActiveProject] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // ── Derived task lists ──────────────────────────────────────

  const filteredByProject = useMemo(() => {
    if (activeProject === "all") return tasks;
    return tasks.filter((t) => t.project_id === activeProject);
  }, [tasks, activeProject]);

  const todayTasks = useMemo(() => {
    const today = todayStr();
    return filteredByProject
      .filter((t) =>
        // Today tasks: overdue OR due today OR (no due date AND not someday)
        !t.is_someday &&
        (
          (t.due_date && (t.due_date === today || isPast(t.due_date))) ||
          !t.due_date
        )
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [filteredByProject]);

  const upcomingTasks = useMemo(() => {
    const today = todayStr();
    const endOfWeek = endOfWeekStr();
    return filteredByProject
      .filter(
        (t) =>
          t.due_date !== null &&
          t.due_date > today &&
          t.due_date <= endOfWeek &&
          t.status !== "completed"
      )
      .sort((a, b) => {
        if (a.due_date! < b.due_date!) return -1;
        if (a.due_date! > b.due_date!) return 1;
        return a.sort_order - b.sort_order;
      });
  }, [filteredByProject]);

  const somedayTasks = useMemo(() => {
    return filteredByProject
      .filter((t) => t.is_someday)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [filteredByProject]);

  // Tasks for the selected day in weekly view
  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return [];
    return filteredByProject
      .filter((t) => t.due_date === selectedDay && t.status !== "completed")
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [filteredByProject, selectedDay]);

  // Get tasks for a specific date (for weekly view)
  const getTasksForDate = useCallback(
    (date: string) => {
      return filteredByProject
        .filter((t) => t.due_date === date && t.status !== "completed")
        .sort((a, b) => a.sort_order - b.sort_order);
    },
    [filteredByProject]
  );

  // Get current view's tasks
  const currentTasks = useMemo(() => {
    switch (activeView) {
      case "today":
        return todayTasks;
      case "upcoming":
        return upcomingTasks;
      case "someday":
        return somedayTasks;
      default:
        return todayTasks;
    }
  }, [activeView, todayTasks, upcomingTasks, somedayTasks]);

  // ── Actions ─────────────────────────────────────────────────

  const addTask = useCallback(
    (title: string) => {
      const newTask: DemoTask = {
        id: `d${Date.now()}`,
        title,
        status: "active",
        due_date: activeView === "upcoming" ? dateOffset(1) : null,
        is_someday: activeView === "someday",
        project_id: activeProject === "all" ? "personal" : activeProject,
        sort_order: 0,
      };

      setTasks((prev) => [newTask, ...prev]);
    },
    [activeView, activeProject]
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "active" ? "completed" : "active",
            }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTaskTitle = useCallback((id: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
  }, []);

  const moveTaskToCategory = useCallback((id: string, view: DemoView) => {
    const today = todayStr();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        switch (view) {
          case "today":
            // Move to today view (clear due date, clear someday)
            return { ...t, due_date: null, is_someday: false };
          case "upcoming":
            // If already has a future date this week, keep it
            // Otherwise set to tomorrow
            if (t.due_date && t.due_date > today && isThisWeek(t.due_date)) {
              return { ...t, is_someday: false };
            }
            return { ...t, due_date: dateOffset(1), is_someday: false };
          case "someday":
            return { ...t, due_date: null, is_someday: true };
          default:
            return t;
        }
      })
    );
  }, []);

  const moveTaskToDate = useCallback((id: string, date: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, due_date: date, is_someday: false } : t
      )
    );
  }, []);

  const reorderTasks = useCallback(
    (activeId: string, overId: string) => {
      setTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === activeId);
        const newIndex = prev.findIndex((t) => t.id === overId);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const newTasks = [...prev];
        const [removed] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, removed);

        // Update sort orders
        return newTasks.map((t, i) => ({ ...t, sort_order: i }));
      });
    },
    []
  );

  // ── Counts for sidebar badges ───────────────────────────────

  const counts = useMemo(() => {
    const today = todayStr();
    const endOfWeek = endOfWeekStr();
    const projectFiltered =
      activeProject === "all"
        ? tasks
        : tasks.filter((t) => t.project_id === activeProject);

    return {
      today: projectFiltered.filter(
        (t) =>
          t.status === "active" &&
          !t.is_someday &&
          (
            (t.due_date && (t.due_date === today || isPast(t.due_date))) ||
            !t.due_date
          )
      ).length,
      upcoming: projectFiltered.filter(
        (t) =>
          t.due_date !== null &&
          t.due_date > today &&
          t.due_date <= endOfWeek &&
          t.status === "active"
      ).length,
      someday: projectFiltered.filter(
        (t) =>
          t.is_someday &&
          t.status === "active"
      ).length,
    };
  }, [tasks, activeProject]);

  return {
    // State
    tasks,
    activeView,
    setActiveView,
    activeProject,
    setActiveProject,
    selectedDay,
    setSelectedDay,

    // Task lists
    todayTasks,
    upcomingTasks,
    somedayTasks,
    selectedDayTasks,
    currentTasks,
    getTasksForDate,
    counts,

    // Actions
    addTask,
    toggleTask,
    deleteTask,
    updateTaskTitle,
    moveTaskToCategory,
    moveTaskToDate,
    reorderTasks,
  };
}
