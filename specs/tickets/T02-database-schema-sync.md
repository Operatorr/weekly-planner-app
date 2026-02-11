# Ticket T02: Database Schema & TanStack DB Sync Layer

## Overview

Set up the Neon PostgreSQL database with the complete schema for Marrow Tasker, configure TanStack DB collections on the client, and establish the ElectricSQL sync layer between them. After this ticket, the app has a reactive, local-first data layer that syncs with a serverless PostgreSQL database — the backbone for all task and project operations.

**References**: __@Epic Brief: Marrow Tasker__ (Tech Stack Reference), __@Core Flows: Marrow Tasker__ (F1.5 through F1.14, F2.1–F2.4)

## Scope

### In Scope

1. **Neon PostgreSQL Schema** (__@src/server/db/schema.sql__)
   * `users` table — id (Clerk user ID), email, display_name, tier (free/pro), created_at, updated_at
   * `projects` table — id (UUID), user_id (FK), name, color, sort_order, is_default, created_at, updated_at
   * `tasks` table — id (UUID), user_id (FK), project_id (FK), title, description, status (active/completed), due_date, sort_order, created_at, updated_at, completed_at
   * `checklist_items` table — id (UUID), task_id (FK), title, is_completed, sort_order, created_at
   * `reminders` table — id (UUID), task_id (FK), user_id (FK), type (email/calendar), reminder_at, sent (boolean), created_at
   * `filter_views` table — id (UUID), user_id (FK), name, config (JSONB), created_at, updated_at
   * `activity_log` table — id (UUID), user_id (FK), action (created/completed/edited/deleted), entity_type (task/project), entity_id, details (JSONB), created_at
   * Proper indexes on: user_id, project_id, task_id, due_date, status, created_at

2. **TanStack DB Collections** (__@src/db/collections.ts__)
   * `tasksCollection` — typed collection for tasks with optimistic mutation support
   * `projectsCollection` — typed collection for projects
   * `checklistCollection` — typed collection for checklist items
   * `remindersCollection` — typed collection for reminders
   * `filterViewsCollection` — typed collection for saved filters
   * `activityCollection` — typed collection for activity log entries

3. **TanStack DB Live Queries** (__@src/db/queries.ts__)
   * `useUndatedAndTodayTasks(projectId?)` — tasks with no date, overdue, or due today
   * `useWeeklyTasks(projectId?)` — tasks due this week (Mon–Sun), grouped by day
   * `useFutureTasks(projectId?)` — tasks due after this week
   * `useProjectTasks(projectId)` — all tasks for a specific project
   * `useAllTasks()` — all tasks across all projects
   * `useProjects()` — all projects for the current user
   * `useChecklist(taskId)` — checklist items for a task
   * `useActivityLog(limit?)` — recent activity entries

4. **Sync Configuration** (__@src/db/sync.ts__)
   * ElectricSQL sync setup between TanStack DB and Neon
   * Configure sync modes: eager for projects/filters, on-demand for tasks (could be large)
   * Sync status indicator state (synced/syncing/offline)
   * User-scoped data isolation (each user only syncs their own data)

5. **TypeScript Types** (__@src/lib/types.ts__)
   * `Task`, `Project`, `ChecklistItem`, `Reminder`, `FilterView`, `ActivityEntry` types
   * `TaskStatus`, `ReminderType`, `ActivityAction`, `UserTier` enums
   * Zod schemas for validation

### Out of Scope

* Server functions for CRUD operations (covered in T04)
* UI components (covered in T05+)
* Migration tooling / CLI (use raw SQL for MVP, consider Drizzle migrations later)
* Multi-tenancy security beyond user_id scoping (future)

## Acceptance Criteria

* Neon database is provisioned and the schema SQL executes without errors
* All tables have proper foreign key constraints and indexes
* TanStack DB collections are defined with correct TypeScript types matching the DB schema
* Live queries return correctly filtered and sorted data from local TanStack DB
* ElectricSQL sync is configured and data round-trips successfully (write locally → sync to Neon → read back)
* User-scoped data isolation works — user A cannot see user B's data
* Sync status is exposed as a reactive state (can be consumed by UI components)
* Zod schemas validate task/project input correctly (name required, etc.)
* `DATABASE_URL` environment variable connects to Neon successfully

## Technical Notes

* TanStack DB v0.5+ uses three sync modes. For tasks, start with "progressive" mode (load active tasks immediately, sync all in background). For projects and filters, use "eager" mode (small datasets).
* ElectricSQL handles the WebSocket sync layer. Ensure the Neon database has the required ElectricSQL extensions/configuration.
* For the activity log, consider using a server-side trigger or TanStack DB mutation middleware to automatically log actions.
* Sort order should use fractional indexing (e.g., `lexorank` or simple float-based ordering) to allow efficient reordering without updating all rows.
* The `config` JSONB field in `filter_views` stores the filter criteria as a typed JSON object — define a `FilterConfig` type.
* Be aware that TanStack DB is beta — if sync issues arise, consider a fallback path using TanStack Query + server functions directly.

## Dependencies

T01 (Project Scaffolding) — needs the project structure and dependencies installed.
