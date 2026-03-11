# Epic Brief: DoMarrow — Todo List SaaS Application

## Summary

DoMarrow is a modern, clean, minimal task management SaaS application built on TanStack Start (React), Shadcn UI, TanStack DB with Neon PostgreSQL, Clerk authentication, and Resend email services — deployed to Vercel. The product delivers a freemium task management experience inspired by Things and Todoist, emphasizing beautiful design, delightful interactions, and a structured daily/weekly workflow. The MVP launches with a Free tier only (Pro tier defined but disabled pending Stripe integration), supporting personal project management with smart task organization across four temporal views: undated/overdue, today, weekly, and future. Success looks like a fully functional, deployable SaaS with landing page, pricing page, authentication flow, and a core task management experience that feels polished enough for early adopters.

## Context & Problem

### Who's Affected

**Primary**: Individual professionals and productivity enthusiasts who need a lightweight, beautiful task manager that doesn't overwhelm with features. They're tired of bloated project management tools and want something that respects their attention — a tool that helps them plan their day and week without cognitive overhead.

**Secondary**: The founding team (currently solo) who needs a deployable product to validate the market, gather early users on the Free tier, and build toward monetization via the Pro tier once Stripe integration is possible.

### Current State

Nothing exists yet. This is a greenfield build. The tech stack has been selected:

- **Framework**: TanStack Start v1 RC (React) — full-stack SSR framework with file-based routing, server functions, and streaming
- **UI**: Shadcn UI — copy-paste component library built on Radix primitives and Tailwind CSS
- **Database**: TanStack DB v0.5+ (beta) — reactive client-first data store with query-driven sync, paired with Neon serverless PostgreSQL
- **Sync**: ElectricSQL integration for real-time sync between TanStack DB and Neon
- **Auth**: Clerk — managed authentication with email verification, session management, and user management
- **Email**: Resend — transactional email for reminders and notifications
- **Deployment**: Vercel — serverless deployment with edge functions

TanStack DB is still in beta (v0.5.25) but provides three sync modes (eager, on-demand, progressive) and sub-millisecond incremental live query updates. This is a deliberate choice to build on cutting-edge local-first architecture.

### The Pain

**No Product Exists**: There is no current product to iterate on. The entire application needs to be built from scratch — landing page, authentication, database schema, task management UI, and deployment pipeline.

**Tech Stack Risk**: TanStack DB is beta software. APIs may change, documentation may be incomplete, and edge cases may surface during implementation. The team must be prepared to work through rough edges and potentially contribute fixes upstream.

**Monetization Delay**: Without a registered company, Stripe integration cannot proceed. The Pro tier must be fully designed and spec'd but implemented as disabled/coming-soon. This means the Free tier must be compelling enough on its own to attract and retain early users.

**Design Complexity**: The Things-inspired minimal aesthetic requires significant attention to animations, transitions, and interaction design. A "clean and minimal" UI is paradoxically harder to execute well than a feature-dense one — every pixel matters.

### Where in the Product

- **Landing Page** (Priority 1): Marketing page introducing DoMarrow, its value proposition, and call-to-action for sign-up
- **Pricing Page** (Priority 1): Two-tier pricing display (Free active, Pro disabled/coming-soon) with feature comparison
- **Authentication System** (Priority 1): Clerk-powered sign-up/sign-in with email verification via Resend
- **Task Management — Core UI** (Priority 1): The main application interface with four sections (Add Task, Task List, Weekly View, Future Tasks) and project tabs
- **Database Schema & Sync** (Priority 1): Neon PostgreSQL schema, TanStack DB collections, and ElectricSQL sync layer
- **Task CRUD Operations** (Priority 1): Create, read, update, delete, and reorder tasks with optimistic mutations
- **Project Management** (Priority 1): Create projects, switch between project views via tabs, "All" aggregation view
- **Reminders System** (Priority 2): Email reminders via Resend and calendar integration stubs
- **Filter Views** (Priority 2): Saved filter configurations (1 for Free tier)
- **Activity History** (Priority 2): 1-week activity log for Free tier
- **Board Layout** (Future): Kanban-style board view alongside list view
- **Pro Tier Features** (Future): Calendar layout, task duration, custom reminders, Task Assist AI, deadlines, extended limits

### Success Criteria

- A fully deployed SaaS application on Vercel with a custom domain-ready configuration
- Landing page that clearly communicates the product's value and converts visitors to sign-ups
- Pricing page that displays both tiers with the Pro tier gracefully disabled
- Seamless Clerk authentication flow with email verification working end-to-end
- Task management interface where a user can: create tasks with name, description, date, reminder, and project assignment; view undated/overdue tasks, today's tasks, weekly calendar, and future tasks; reorder tasks via drag-and-drop; switch between project-scoped views via tabs
- TanStack DB providing reactive, local-first data with sync to Neon PostgreSQL
- Sub-second UI responsiveness for all task operations (create, update, reorder, delete)
- Clean, minimal, Things-inspired design with smooth animations and thoughtful whitespace
- Mobile-responsive layout that works well on desktop, tablet, and mobile
- The entire system is architected so that Pro tier features can be incrementally enabled without major refactoring

---

## Tech Stack Reference

| Layer | Technology | Version/Status |
|-------|-----------|----------------|
| Framework | TanStack Start | v1 RC |
| UI Components | Shadcn UI | Latest |
| Styling | Tailwind CSS | v4 |
| Client Database | TanStack DB | v0.5+ (beta) |
| Server Database | Neon PostgreSQL | Serverless |
| Sync Engine | ElectricSQL | Latest |
| Authentication | Clerk | Latest |
| Email | Resend | Latest |
| Deployment | Vercel | Latest |
| Package Manager | pnpm | Latest |
| Language | TypeScript | v5+ |

---

## Pricing Tiers Reference

### Free Tier (Active)

| Feature | Limit |
|---------|-------|
| Personal projects | 1 |
| Smart quick add (quick entry with optional fields) | ✓ |
| Task reminders (one-time) | ✓ |
| Flexible list layout | ✓ |
| Filter views | 1 |
| Activity history | 1 week |
| Integrations (email, calendar) | ✓ |

### Pro Tier (Disabled — Coming Soon)

| Feature | Limit |
|---------|-------|
| Personal projects | 300 |
| Board (Kanban) layout | ✓ |
| Calendar layout | ✓ |
| Task duration | ✓ |
| Custom task reminders (recurring, snooze) | ✓ |
| Filter views | 150 |
| Activity history | Unlimited |
| Task Assist (AI via OpenRouter) | ✓ |
| Deadlines | ✓ |

**Pro Pricing**: US$3/user/month billed yearly ($36/year) or US$4/month billed monthly.
