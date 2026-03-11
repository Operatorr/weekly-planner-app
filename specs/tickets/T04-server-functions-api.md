# Ticket T04: Server Functions & API Layer

## Overview

Implement all server-side functions for DoMarrow's CRUD operations — tasks, projects, checklists, reminders, filters, and activity logging. These server functions are called by TanStack DB mutations and also serve as the sync endpoint for ElectricSQL. After this ticket, all data operations are wired end-to-end: client mutation → server function → Neon database → sync back to client.

**References**: __@Epic Brief: DoMarrow__ (Tech Stack Reference), __@Core Flows: DoMarrow__ (F1.5–F1.14, F2.1–F2.4)

## Scope

### In Scope

1. **Task Server Functions** (__@src/server/tasks.ts__)
   * `createTask` — validate input (Zod), insert into Neon, log activity, return task
   * `updateTask` — validate, update fields, log activity, return updated task
   * `completeTask` — set status=completed, completed_at=now, log activity
   * `uncompleteTask` — set status=active, completed_at=null, log activity
   * `deleteTask` — soft or hard delete, cascade checklist items, log activity
   * `reorderTasks` — update sort_order for a batch of tasks (accepts array of {id, sort_order})
   * `moveTaskToProject` — update project_id, log activity

2. **Project Server Functions** (__@src/server/projects.ts__)
   * `createProject` — validate input, enforce Free tier limit (1 project), insert, log activity
   * `updateProject` — validate, update name/color, log activity
   * `deleteProject` — cascade delete tasks, log activity, prevent deletion of default project
   * `reorderProjects` — update sort_order for project tabs

3. **Checklist Server Functions** (__@src/server/checklists.ts__)
   * `addChecklistItem` — validate, insert as child of task
   * `updateChecklistItem` — update title or completion status
   * `deleteChecklistItem` — remove from task
   * `reorderChecklistItems` — update sort_order within a task

4. **Reminder Server Functions** (__@src/server/reminders.ts__)
   * `setReminder` — create/update reminder for a task, validate reminder_at is in the future
   * `removeReminder` — delete reminder for a task
   * `processReminders` — server-side cron/scheduled function to check for due reminders and send emails via Resend

5. **Filter View Server Functions** (__@src/server/filters.ts__)
   * `createFilterView` — validate, enforce Free tier limit (1 filter), insert
   * `updateFilterView` — update name or config
   * `deleteFilterView` — remove

6. **Activity Log Server Functions** (__@src/server/activity.ts__)
   * `logActivity` — internal function called by other server functions to record actions
   * `getActivityLog` — return activity entries for the user, enforce 7-day limit on Free tier

7. **Tier Enforcement Middleware** (__@src/server/middleware/tier.ts__)
   * Helper to check user's tier and enforce limits
   * `checkProjectLimit(userId)` — returns true/false if user can create more projects
   * `checkFilterLimit(userId)` — returns true/false if user can create more filters
   * `getActivityHistoryLimit(tier)` — returns the date cutoff for activity history

8. **Input Validation** (__@src/server/validation.ts__)
   * Zod schemas for all server function inputs
   * `createTaskSchema`, `updateTaskSchema`, `createProjectSchema`, etc.
   * Shared with client-side for form validation

### Out of Scope

* Email template design (covered in T08)
* Stripe/payment integration (future, Pro tier)
* Rate limiting (future)
* API versioning (future)

## Acceptance Criteria

* All server functions are defined using TanStack Start's `createServerFn()`
* Every server function validates the authenticated user via Clerk session
* Every server function validates input using Zod schemas
* Task CRUD operations work end-to-end: create, read, update, complete, delete, reorder
* Project CRUD operations work with Free tier limit enforcement (max 1 project)
* Checklist items can be added, updated, deleted, and reordered within a task
* Reminders can be set and removed on tasks
* Activity is logged automatically for every create/update/delete/complete action
* Tier enforcement correctly limits: 1 project, 1 filter, 7-day activity history for Free users
* Server functions return appropriate error responses with descriptive messages
* All server functions are type-safe end-to-end (input types → return types)
* A user cannot access or modify another user's data (every query scoped by user_id)

## Technical Notes

* Use `createServerFn()` from TanStack Start for all server functions — this gives type-safe RPC-style calls from the client
* For activity logging, create a helper that wraps server function logic: `withActivityLog(action, entityType, fn)` pattern
* Tier enforcement should be a composable middleware, not hardcoded checks in every function
* For `reorderTasks`, accept the full list of task IDs in new order and compute fractional sort_order values server-side. Consider using a lexorank-style algorithm.
* The `processReminders` function needs to be a scheduled job. On Vercel, use Vercel Cron Jobs (via `vercel.json` cron configuration) to run this every minute or every 5 minutes.
* For ElectricSQL sync, ensure server functions write to the same tables that ElectricSQL watches — the sync layer should pick up changes automatically.
* Be strict about authorization: every server function must start with `const user = await getAuth(request)` and scope all queries with `WHERE user_id = user.id`.

## Dependencies

T01 (Project Scaffolding) — project structure.
T02 (Database Schema) — tables and TanStack DB collections.
T03 (Authentication) — Clerk session for server-side auth.
