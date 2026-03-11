# Ticket T01: Project Scaffolding & Infrastructure Setup

## Overview

Bootstrap the DoMarrow monorepo with TanStack Start (React), configure Tailwind CSS v4, install Shadcn UI, set up TypeScript, and establish the project structure. This is the foundation ticket — everything else builds on top of it. After this ticket is done, a developer can `pnpm dev` and see a running TanStack Start app with Shadcn components available.

**References**: __@Epic Brief: DoMarrow__ (Tech Stack Reference), __@Core Flows: DoMarrow__ (all flows depend on this foundation)

## Scope

### In Scope

1. **Project Initialization**
   * Create TanStack Start app via `npm create @tanstack/start@latest`
   * Configure `pnpm` as the package manager
   * Set up TypeScript v5+ with strict mode
   * Configure `vite.config.ts` for TanStack Start

2. **Styling & UI Setup**
   * Install and configure Tailwind CSS v4
   * Initialize Shadcn UI with "New York" style (clean/minimal aesthetic)
   * Configure CSS variables for DoMarrow theme (clean, Things-inspired palette)
   * Install core Shadcn components: Button, Input, Card, Dialog, DropdownMenu, Popover, Tabs, Badge, Toast, Tooltip, Separator, Avatar, Command (for Quick Find)

3. **Project Structure** (__@src/__)
   * `src/routes/` — File-based routing directory
   * `src/routes/__root.tsx` — Root layout
   * `src/components/` — Shared UI components
   * `src/components/ui/` — Shadcn UI components
   * `src/lib/` — Utility functions, constants, types
   * `src/lib/utils.ts` — cn() helper and shared utilities
   * `src/styles/` — Global styles, Tailwind config
   * `src/hooks/` — Custom React hooks
   * `src/db/` — TanStack DB collections and schema (placeholder)
   * `src/server/` — Server-side logic (placeholder)

4. **Development Tooling**
   * ESLint configuration with TypeScript rules
   * Prettier configuration
   * `.env.example` with placeholder environment variables
   * `.gitignore` configured for Node.js / Vercel

5. **Vercel Configuration**
   * `vercel.json` or Vercel-compatible configuration
   * Ensure TanStack Start builds correctly for Vercel serverless deployment

### Out of Scope

* Database setup (covered in T02)
* Authentication setup (covered in T03)
* Actual page content (covered in T05+)
* CI/CD pipeline (separate ticket, future)
* Testing framework setup (separate ticket, future)

## Acceptance Criteria

* `pnpm install` completes without errors
* `pnpm dev` starts the development server and renders a "Hello, DoMarrow" placeholder page
* Shadcn UI components render correctly (verified by rendering a sample Button and Card)
* Tailwind CSS classes work throughout the application
* TypeScript strict mode is enabled with zero type errors
* File-based routing works — visiting `/` renders the root route
* Theme colors are configured for a clean, minimal aesthetic (neutral grays, subtle accent color)
* Project structure matches the specified directory layout
* `.env.example` contains placeholders for: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `RESEND_API_KEY`
* Build succeeds: `pnpm build` produces a deployable output

## Technical Notes

* Use `npm create @tanstack/start@latest` for the initial scaffold, then adjust the structure as needed
* Shadcn UI "New York" variant aligns best with the Things-inspired minimal aesthetic
* For the color theme, consider: primary (slate/zinc), accent (subtle blue or teal), destructive (muted red), background (white/near-white)
* TanStack Start v1 RC uses Vinxi under the hood for the dev server — ensure compatibility
* Configure path aliases (`@/` → `src/`) for cleaner imports
* Ensure the Vite config supports Vercel's serverless functions output

## Dependencies

None (foundation ticket).
