-- DoMarrow: Neon PostgreSQL Schema
-- Run this against your Neon database to bootstrap all tables.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,              -- Clerk user ID
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  tier          TEXT NOT NULL DEFAULT 'free'   -- 'free' | 'pro'
    CHECK (tier IN ('free', 'pro')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6B7280',
  sort_order  REAL NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  due_date      DATE,
  is_someday    BOOLEAN NOT NULL DEFAULT false,
  sort_order    REAL NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  sort_order    REAL NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'email'
    CHECK (type IN ('email', 'calendar')),
  reminder_at TIMESTAMPTZ NOT NULL,
  sent        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Filter views (saved filters)
CREATE TABLE IF NOT EXISTS filter_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  config      JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL
    CHECK (action IN ('created', 'updated', 'completed', 'uncompleted', 'deleted')),
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('task', 'project', 'checklist_item', 'reminder', 'filter_view')),
  entity_id   UUID NOT NULL,
  details     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id     ON projects(user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id        ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id     ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date       ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status         ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_someday     ON tasks(is_someday);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at     ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_cleanup ON tasks(user_id, status, completed_at)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_checklist_task_id    ON checklist_items(task_id);

CREATE INDEX IF NOT EXISTS idx_reminders_task_id    ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id    ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent       ON reminders(sent) WHERE sent = false;

CREATE INDEX IF NOT EXISTS idx_filter_views_user_id ON filter_views(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_user_id     ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at  ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_entity      ON activity_log(entity_type, entity_id);
