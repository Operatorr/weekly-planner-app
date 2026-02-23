# Marrow Tasker — Execution Tracker

> **Architecture note**: The project was scaffolded as a **Vite + TanStack Router SPA**, not TanStack Start SSR as originally spec'd. Impacts:
> - T03: Use `@clerk/react` (not `@clerk/tanstack-start`)
> - T04: Use Vercel serverless API routes (not `createServerFn`)
> - T02: Use Neon serverless HTTP driver from API routes

Each ticket below links to its full spec in [`specs/tickets/`](tickets/) and the user flows it implements from [`specs/core-flows.md`](core-flows.md) (prefixed **F#.#**). Both derive from the [`specs/epic-brief.md`](epic-brief.md).

---

## T01 · Project Scaffolding

**Ticket**: [T01](tickets/T01-project-scaffolding.md) · **Flows**: all flows depend on this foundation

- [x] TanStack Router + Vite + TypeScript v5
- [x] Tailwind CSS v4
- [x] Shadcn UI — Button, Input, Card, Badge, Tooltip, Separator
- [x] File-based routing (`app/routes/`)
- [x] `.env.example` with all required keys
- [ ] Missing Shadcn components: Dialog, DropdownMenu, Popover, Tabs, Toast, Avatar, Command
- [ ] `app/hooks/` directory
- [ ] `app/db/` directory
- [ ] `api/` directory (Vercel serverless functions)
- [ ] `vercel.json`
- [ ] ESLint + Prettier config

---

## T02 · Database Schema & Data Layer

**Ticket**: [T02](tickets/T02-database-schema-sync.md) · **Flows**: F1.5–F1.14, F2.1–F2.4

- [ ] Neon PostgreSQL schema — tables: `users`, `projects`, `tasks`, `checklist_items`, `reminders`, `filter_views`, `activity_log`
- [ ] Indexes on `user_id`, `project_id`, `due_date`, `status`, `created_at`
- [ ] TypeScript types in `app/lib/types.ts` — Task, Project, ChecklistItem, Reminder, FilterView, ActivityEntry
- [ ] Zod validation schemas in `app/lib/schemas.ts`
- [ ] Neon DB client setup (`app/lib/db.ts` — `@neondatabase/serverless`)
- [ ] TanStack Query hooks (replaces TanStack DB for SPA): `useTasks`, `useProjects`, `useChecklist`, `useActivityLog`
- [ ] Query: undated + overdue + today tasks
- [ ] Query: this-week tasks grouped by day
- [ ] Query: future tasks grouped by week
- [ ] Optimistic updates via TanStack Query `useMutation`

---

## T03 · Authentication (Clerk)

**Ticket**: [T03](tickets/T03-authentication.md) · **Flows**: F1.1 Sign Up, F1.2 Sign In, F1.3 Sign Out, F1.4 Password Reset

- [ ] Install `@clerk/react`
- [ ] Wrap app in `<ClerkProvider>` in `app/routes/__root.tsx`
- [ ] `/sign-in` route with `<SignIn />` component
- [ ] `/sign-up` route with `<SignUp />` component
- [ ] Route guard on `/app` layout — redirect unauthenticated users to `/sign-in`
- [ ] User provisioning on first sign-in: create Neon `users` record + default "Personal" project
- [ ] Replace static profile avatar in `header.tsx` with Clerk `<UserButton />`
- [ ] Sign-out clears local query cache and redirects to `/`
- [ ] Update `navbar.tsx` CTAs: "Sign In" → `/sign-in`, "Get Started Free" → `/sign-up`
- [ ] Conditional CTA in Navbar: authenticated users see "Go to App"

---

## T04 · API Layer (Vercel Serverless Routes)

**Ticket**: [T04](tickets/T04-server-functions-api.md) · **Flows**: F1.5–F1.14, F2.1–F2.4

- [ ] Auth middleware helper — validate Clerk session token on every route
- [ ] `POST /api/tasks` — createTask (Zod validate, insert, log activity)
- [ ] `PATCH /api/tasks/:id` — updateTask
- [ ] `PATCH /api/tasks/:id/complete` — completeTask / uncompleteTask
- [ ] `DELETE /api/tasks/:id` — deleteTask
- [ ] `POST /api/tasks/reorder` — reorderTasks (batch sort_order update)
- [ ] `POST /api/projects` — createProject (enforce 1-project Free limit)
- [ ] `PATCH /api/projects/:id` — updateProject
- [ ] `DELETE /api/projects/:id` — deleteProject (cascade tasks, block default)
- [ ] `POST /api/checklist` — addChecklistItem
- [ ] `PATCH /api/checklist/:id` — updateChecklistItem
- [ ] `DELETE /api/checklist/:id` — deleteChecklistItem
- [ ] `POST /api/reminders` — setReminder
- [ ] `DELETE /api/reminders/:id` — removeReminder
- [ ] `POST /api/filters` — createFilterView (enforce 1-filter Free limit)
- [ ] `GET /api/activity` — getActivityLog (enforce 7-day Free limit)
- [ ] Tier enforcement helper: `checkProjectLimit`, `checkFilterLimit`, `getActivityCutoff`

---

## T05 · Landing & Pricing Pages ✅

**Ticket**: [T05](tickets/T05-landing-pricing-pages.md) · **Flows**: F1.15 Landing Page, F1.16 Pricing Page

- [x] Landing page (`/`) — hero, features, how it works, CTA, footer
- [x] Pricing page (`/pricing`) — tier cards, billing toggle, comparison table, FAQ
- [x] Navbar — responsive, mobile hamburger menu
- [x] Footer
- [ ] Update Navbar: "Sign In" → `/sign-in`, "Get Started Free" → `/sign-up`
- [ ] Conditional auth state in Navbar (show "Go to App" when signed in via `useAuth()`)

---

## T06 · App Layout & Navigation ✅ (Static — needs wiring)

**Ticket**: [T06](tickets/T06-app-layout-navigation.md) · **Flows**: F3.1 App Navigation, F1.12 Switch Projects

- [x] App layout shell (`app/routes/app/route.tsx`)
- [x] Header — sidebar toggle, logo, quick find trigger, sync dot, profile avatar
- [x] Sidebar — nav items, projects list, filters section (all static/mock)
- [x] Project tabs bar (static/mock)
- [x] `AppContext` for sidebar + active project state
- [ ] Wire sidebar projects list to real DB (`useProjects` query)
- [ ] Wire project tabs to real DB (`useProjects` query)
- [ ] Project tab switching filters all four task sections
- [ ] Inline project creation from "+" in tabs bar
- [ ] Keyboard shortcut: `Cmd/Ctrl + \` toggles sidebar
- [ ] Keyboard shortcut: `Cmd/Ctrl + K` opens Quick Find
- [ ] Keyboard shortcut: `N` focuses Add Task input
- [ ] Mobile sidebar as drawer overlay (Shadcn `Sheet`)
- [ ] Real sync status indicator (connected to TanStack Query network state)

---

## T07 · Task Management UI ✅ (Static — needs wiring)

**Ticket**: [T07](tickets/T07-task-management-ui.md) · **Flows**: F1.5 Create, F1.6 View, F1.7 Edit, F1.8 Complete, F1.9 Delete, F1.10 Reorder

- [x] `AddTask` component — expand/collapse, name + description fields
- [x] `TaskItem` component — checkbox animation, metadata badges, hover actions
- [x] `TaskDetail` sheet — view/edit fields, checklist display, delete confirm
- [x] `TaskList` section — active/completed toggle, empty state, sort by overdue
- [x] `WeeklyView` section — 7-day grid, today highlight
- [x] `FutureTasks` section — grouped by week, collapsible
- [ ] Wire `AddTask` → `createTask` API mutation (with date, reminder, project fields functional)
- [ ] Functional date picker in `AddTask` and `TaskDetail` (Shadcn Calendar + Popover)
- [ ] Functional reminder selector in `AddTask` and `TaskDetail`
- [ ] Functional project selector in `AddTask` and `TaskDetail`
- [ ] Wire task checkbox → `completeTask` mutation + undo toast
- [ ] Wire task delete in `TaskDetail` → `deleteTask` mutation + undo toast
- [ ] Wire `TaskDetail` auto-save (debounced 500ms) → `updateTask` mutation
- [ ] Add checklist items in `TaskDetail` (functional input + `addChecklistItem`)
- [ ] Toast notifications: task completed / deleted with 5s Undo (Shadcn Toast)
- [ ] Install `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- [ ] DnD within Section 2 — reorder tasks (`reorderTasks`)
- [ ] DnD within Section 3 — reorder within day column
- [ ] DnD between Section 3 columns — reschedule task (update `due_date`)
- [ ] DnD Section 2 → Section 3 — set due date
- [ ] DnD Section 3 → Section 2 — remove due date
- [ ] Context menu on task items (right-click: Edit, Complete, Delete, Set Date, Move to Project)

---

## T08 · Email Reminders

**Ticket**: [T08](tickets/T08-email-reminders.md) · **Flows**: F2.1 Set a Task Reminder

- [ ] Install `resend` npm package
- [ ] Resend client helper (`app/lib/resend.ts`)
- [ ] Task reminder email template (`api/email/task-reminder.tsx` — React Email or HTML)
- [ ] Welcome email template (`api/email/welcome.tsx`)
- [ ] Cron endpoint `GET /api/cron/process-reminders` — query due reminders, send emails, mark `sent = true`
- [ ] `CRON_SECRET` env var — protect cron endpoint
- [ ] `vercel.json` cron job (every 5 minutes)
- [ ] Send welcome email on new user provisioning

---

## T09 · Quick Find, Filters & Activity

**Ticket**: [T09](tickets/T09-quick-find-filters-activity.md) · **Flows**: F3.2 Quick Find, F2.3 Filter Views, F2.4 Activity History

- [ ] Install Shadcn `Command` component
- [ ] `QuickFind` modal (`app/components/app/quick-find.tsx`) — fuzzy search tasks + projects from local cache
- [ ] Wire Quick Find to `Cmd/Ctrl + K` shortcut
- [ ] Keyboard navigation in results (arrow keys + Enter)
- [ ] Filter panel (`app/components/app/filter-panel.tsx`) — date range, project, status, has reminder
- [ ] Live preview as filters are configured
- [ ] Save filter view → `createFilterView` API (enforce 1-filter Free limit)
- [ ] Saved filters displayed in sidebar
- [ ] Activity History route (`app/routes/app/activity.tsx`)
- [ ] Activity feed — icons, descriptions, relative timestamps (`date-fns`)
- [ ] 7-day limit enforcement for Free tier with upgrade prompt

---

## T10 · Polish & Deploy

**Ticket**: [T10](tickets/T10-polish-deploy.md) · **Flows**: all flows (end-to-end verification)

- [ ] Task creation slide-in animation
- [ ] Task completion fade-out animation (checkbox → strikethrough → remove)
- [ ] Task detail sheet open/close animation
- [ ] Skeleton loaders for task lists and weekly view (Shadcn `Skeleton`)
- [ ] Global error boundary with retry button
- [ ] Offline detection banner (`navigator.onLine` + events)
- [ ] 404 route
- [ ] Responsive audit: 375px, 768px, 1024px, 1440px
- [ ] Mobile: sidebar drawer, weekly view horizontal scroll-snap, bottom-sheet task detail
- [ ] SEO meta tags on landing + pricing (title, description, OG, Twitter Card)
- [ ] `robots.txt`, favicon, `apple-touch-icon`
- [ ] `vercel.json` — build settings + cron + env var references
- [ ] Deploy to Vercel + configure all env vars in dashboard
- [ ] Verify cron job fires in production (Vercel logs)
- [ ] End-to-end smoke test in production

---

## Priority Order — Next Up

| # | Ticket | What to do |
|---|--------|-----------|
| 1 | **T03** | Clerk auth — sign-in/sign-up routes, route guard, user provisioning |
| 2 | **T02** | Neon schema + DB client + TanStack Query hooks |
| 3 | **T04** | API routes for task + project CRUD |
| 4 | **T06** wire-up | Connect sidebar + tabs to real data; project filtering |
| 5 | **T07** wire-up | Connect all task operations to real DB; date/reminder pickers |
| 6 | **T05** wire-up | Update Navbar CTAs to auth routes |
| 7 | **T07** DnD | Install @dnd-kit, implement drag-and-drop |
| 8 | **T08** | Resend email reminders + cron |
| 9 | **T09** | Quick Find, Filters, Activity History |
| 10 | **T10** | Polish + deploy |
