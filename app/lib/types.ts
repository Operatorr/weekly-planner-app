// ── Enums ────────────────────────────────────────────────────────

export type TaskStatus = "active" | "completed";
export type ReminderType = "email" | "calendar";
export type ActivityAction = "created" | "completed" | "edited" | "deleted";
export type EntityType = "task" | "project";
export type UserTier = "free" | "pro";

// ── Domain models ────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  tier: UserTier;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  type: ReminderType;
  reminder_at: string;
  sent: boolean;
  created_at: string;
}

export interface FilterConfig {
  status?: TaskStatus;
  project_id?: string;
  has_due_date?: boolean;
  due_before?: string;
  due_after?: string;
}

export interface FilterView {
  id: string;
  user_id: string;
  name: string;
  config: FilterConfig;
  created_at: string;
  updated_at: string;
}

export interface ActivityEntry {
  id: string;
  user_id: string;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ── Input types (for create / update mutations) ──────────────────

export interface CreateTaskInput {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  sort_order?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  project_id?: string;
  due_date?: string | null;
  sort_order?: number;
}

export interface CreateProjectInput {
  name: string;
  color?: string;
  sort_order?: number;
  is_default?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  sort_order?: number;
  is_default?: boolean;
}

export interface CreateChecklistItemInput {
  task_id: string;
  title: string;
  sort_order?: number;
}

export interface UpdateChecklistItemInput {
  title?: string;
  is_completed?: boolean;
  sort_order?: number;
}
