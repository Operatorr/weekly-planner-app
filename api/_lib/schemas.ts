import { z } from "zod";

// --- Tasks ---

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  project_id: z.string().uuid().optional().nullable(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  is_someday: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  project_id: z.string().uuid().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  is_someday: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export const completeTaskSchema = z.object({
  completed: z.boolean(),
});

export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().uuid(),
      sort_order: z.number(),
    }),
  ),
});

// --- Projects ---

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#6B7280"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// --- Checklist ---

export const addChecklistItemSchema = z.object({
  task_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  sort_order: z.number().optional(),
});

export const updateChecklistItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  is_completed: z.boolean().optional(),
  sort_order: z.number().optional(),
});

// --- Reminders ---

export const setReminderSchema = z.object({
  task_id: z.string().uuid(),
  type: z.enum(["email", "calendar"]).default("email"),
  reminder_at: z.string().datetime(),
});

// --- AI Dictation ---

export const processDictationSchema = z.object({
  transcription: z.string().min(1).max(10000),
});

// --- Filters ---

const filterConfigSchema = z.object({
  status: z.enum(["active", "completed", "all"]).optional(),
  project_id: z.string().uuid().optional().nullable(),
  has_due_date: z.boolean().optional(),
  has_reminder: z.boolean().optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  date_range: z.enum(["today", "thisWeek", "nextWeek", "throughToday", "overdue", "all"]).optional(),
});

export const createFilterViewSchema = z.object({
  name: z.string().min(1).max(100),
  config: filterConfigSchema,
});

export const updateFilterViewSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: filterConfigSchema.optional(),
});
