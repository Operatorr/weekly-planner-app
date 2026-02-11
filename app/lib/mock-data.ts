export interface Task {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  dueDate?: string; // ISO date string
  completed: boolean;
  completedAt?: string;
  reminderType?: "none" | "email" | "calendar";
  reminderTime?: string;
  sortOrder: number;
  checklist?: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

// Helper to get dates relative to today
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function weekdayOffset(dayOfWeek: number): string {
  const mon = getMonday();
  mon.setDate(mon.getDate() + dayOfWeek);
  return mon.toISOString().split("T")[0];
}

const today = dateOffset(0);

export const mockProjects: Project[] = [
  { id: "personal", name: "Personal", color: "#D4644A", taskCount: 8 },
];

export const mockTasks: Task[] = [
  // Undated tasks
  {
    id: "t1",
    name: "Research best journaling apps for inspiration",
    description: "Look at Day One, Notion, Obsidian for design patterns",
    projectId: "personal",
    completed: false,
    sortOrder: 1,
    createdAt: dateOffset(-3),
  },
  {
    id: "t2",
    name: "Organize bookmarks into folders",
    projectId: "personal",
    completed: false,
    sortOrder: 2,
    createdAt: dateOffset(-2),
  },
  {
    id: "t3",
    name: "Update portfolio website bio",
    description: "Rewrite the about section to be more concise",
    projectId: "personal",
    completed: false,
    sortOrder: 3,
    createdAt: dateOffset(-1),
  },

  // Overdue tasks
  {
    id: "t4",
    name: "Reply to Sarah's email about dinner plans",
    projectId: "personal",
    dueDate: dateOffset(-2),
    completed: false,
    sortOrder: 4,
    reminderType: "email",
    createdAt: dateOffset(-5),
  },

  // Today's tasks
  {
    id: "t5",
    name: "Review quarterly goals and progress",
    description: "Go through each goal and mark status. Adjust timelines if needed.",
    projectId: "personal",
    dueDate: today,
    completed: false,
    sortOrder: 5,
    reminderType: "email",
    reminderTime: "09:00",
    checklist: [
      { id: "cl1", text: "Career goals", completed: true },
      { id: "cl2", text: "Health goals", completed: false },
      { id: "cl3", text: "Financial goals", completed: false },
      { id: "cl4", text: "Personal growth", completed: false },
    ],
    createdAt: dateOffset(-1),
  },
  {
    id: "t6",
    name: "Buy groceries for the week",
    projectId: "personal",
    dueDate: today,
    completed: false,
    sortOrder: 6,
    createdAt: today,
  },
  {
    id: "t7",
    name: "30 minutes meditation practice",
    projectId: "personal",
    dueDate: today,
    completed: true,
    completedAt: today,
    sortOrder: 7,
    createdAt: dateOffset(-1),
  },

  // This week (future days)
  {
    id: "t8",
    name: "Call dentist for appointment",
    projectId: "personal",
    dueDate: weekdayOffset(2), // Wednesday
    completed: false,
    sortOrder: 8,
    createdAt: dateOffset(-1),
  },
  {
    id: "t9",
    name: "Prepare presentation slides",
    description: "For the team sync on Friday. Keep it minimal — 8 slides max.",
    projectId: "personal",
    dueDate: weekdayOffset(3), // Thursday
    completed: false,
    sortOrder: 9,
    reminderType: "email",
    reminderTime: "10:00",
    createdAt: dateOffset(-2),
  },
  {
    id: "t10",
    name: "Friday evening yoga class",
    projectId: "personal",
    dueDate: weekdayOffset(4), // Friday
    completed: false,
    sortOrder: 10,
    createdAt: dateOffset(-3),
  },
  {
    id: "t11",
    name: "Weekend hike at Eagle Creek",
    description: "Pack lunch, water, trail map. Leave by 8am.",
    projectId: "personal",
    dueDate: weekdayOffset(5), // Saturday
    completed: false,
    sortOrder: 11,
    createdAt: dateOffset(-1),
  },

  // Future tasks (beyond this week)
  {
    id: "t12",
    name: "Schedule annual health checkup",
    projectId: "personal",
    dueDate: dateOffset(10),
    completed: false,
    sortOrder: 12,
    createdAt: dateOffset(-5),
  },
  {
    id: "t13",
    name: "Plan birthday surprise for Alex",
    description: "Book restaurant, order cake, coordinate with friends",
    projectId: "personal",
    dueDate: dateOffset(14),
    completed: false,
    sortOrder: 13,
    checklist: [
      { id: "cl5", text: "Book restaurant", completed: false },
      { id: "cl6", text: "Order cake", completed: false },
      { id: "cl7", text: "Send invites to friends", completed: false },
    ],
    createdAt: dateOffset(-2),
  },
  {
    id: "t14",
    name: "Renew gym membership",
    projectId: "personal",
    dueDate: dateOffset(20),
    completed: false,
    sortOrder: 14,
    createdAt: dateOffset(-3),
  },
];

// Date utilities
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
  const mon = getMonday();
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const monStr = mon.toISOString().split("T")[0];
  const sunStr = sun.toISOString().split("T")[0];
  return dateStr >= monStr && dateStr <= sunStr;
}

export function isBeyondThisWeek(dateStr: string): boolean {
  const mon = getMonday();
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const sunStr = sun.toISOString().split("T")[0];
  return dateStr > sunStr;
}

export function getWeekDays(): { label: string; date: string; isToday: boolean }[] {
  const mon = getMonday();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((label, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      label: `${label} ${d.getDate()}`,
      date: dateStr,
      isToday: dateStr === today,
    };
  });
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

export function getWeekRange(): string {
  const mon = getMonday();
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}
