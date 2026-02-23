import { z } from "zod/v4";

// ── Enums ────────────────────────────────────────────────────────

export const TaskStatusSchema = z.enum(["active", "completed"]);
export const ReminderTypeSchema = z.enum(["email", "calendar"]);
export const ActivityActionSchema = z.enum([
  "created",
  "completed",
  "edited",
  "deleted",
]);
export const EntityTypeSchema = z.enum(["task", "project"]);
export const UserTierSchema = z.enum(["free", "pro"]);

// ── Create / Update inputs ───────────────────────────────────────

export const CreateTaskSchema = z.object({
  project_id: z.uuid(),
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  due_date: z.iso.date().nullable().optional(),
  sort_order: z.number().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  status: TaskStatusSchema.optional(),
  project_id: z.uuid().optional(),
  due_date: z.iso.date().nullable().optional(),
  sort_order: z.number().optional(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color")
    .optional(),
  sort_order: z.number().optional(),
  is_default: z.boolean().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  sort_order: z.number().optional(),
  is_default: z.boolean().optional(),
});

export const CreateChecklistItemSchema = z.object({
  task_id: z.uuid(),
  title: z.string().min(1, "Checklist item title is required").max(300),
  sort_order: z.number().optional(),
});

export const UpdateChecklistItemSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  is_completed: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export const FilterConfigSchema = z.object({
  status: TaskStatusSchema.optional(),
  project_id: z.uuid().optional(),
  has_due_date: z.boolean().optional(),
  due_before: z.iso.date().optional(),
  due_after: z.iso.date().optional(),
});

export const CreateFilterViewSchema = z.object({
  name: z.string().min(1, "Filter name is required").max(100),
  config: FilterConfigSchema,
});

export const UpdateFilterViewSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: FilterConfigSchema.optional(),
});
