# Ticket T06: App Layout, Sidebar & Navigation

## Overview

Build the authenticated application shell — the layout wrapper that all `/app/*` pages live inside. This includes the top header bar, collapsible sidebar (Things-style "Slim Mode"), project tab bar, and the main content area. After this ticket, the app has a polished navigation structure that users interact with on every page.

**References**: __@Epic Brief: Marrow Tasker__ (Task Management — Core UI), __@Core Flows: Marrow Tasker__ (F3.1 App Navigation Structure, F1.12 Switch Projects)

## Scope

### In Scope

1. **App Layout Shell** (__@src/routes/app.tsx__ or __@src/routes/app/route.tsx__)
   * Layout component wrapping all `/app/*` child routes
   * Three-panel structure: sidebar (left), main content (center/right), no right panel for MVP
   * Responsive: sidebar overlay on mobile, persistent on desktop

2. **Header Bar** (__@src/components/app/header.tsx__)
   * Left: Sidebar toggle button (hamburger/collapse icon)
   * Center-left: Logo or app name "Marrow Tasker" (links to `/app`)
   * Center: Quick Find trigger button (search icon + "Cmd+K" hint text)
   * Right-center: Sync status indicator — small dot (green = synced, yellow = syncing, red = offline) with tooltip showing status text
   * Right: Profile avatar with Clerk `<UserButton />` or custom dropdown (see F1.3)

3. **Sidebar** (__@src/components/app/sidebar.tsx__)
   * Collapsible sidebar with two states: expanded (full labels) and collapsed (icons only = "Slim Mode")
   * Toggle via: header button click, keyboard shortcut `Cmd/Ctrl + \`, or two-finger swipe (stretch)
   * Navigation items:
     - **Inbox** (icon: inbox) — future, placeholder for now
     - **Today** (icon: sun/calendar-day) — navigates to main task view with today focus
     - **Upcoming** (icon: calendar) — navigates to weekly + future view
     - **Someday** (icon: archive) — undated tasks view
     - Divider
     - **Projects** heading — expandable section listing user's projects
       - Each project shows: colored dot, project name, task count badge
       - "+" button to create new project
     - Divider
     - **Filters** heading — saved filter views (1 for Free tier)
     - Divider
     - **Activity** (icon: clock/history) — activity log
     - **Settings** (icon: gear) — app settings (placeholder)
   * Active item is highlighted
   * Slim Mode: only icons visible, labels hidden, hover shows tooltip with label name
   * Smooth transition animation between expanded and collapsed states

4. **Project Tab Bar** (__@src/components/app/project-tabs.tsx__)
   * Horizontal tab bar above the main content area
   * Leftmost tab: "All" (shows tasks from all projects)
   * One tab per project (shows project name, possibly with colored indicator)
   * Rightmost: "+" icon button to create a new project (opens inline name input)
   * Active tab styling: underline or accent border-bottom
   * Tabs are scrollable horizontally if they overflow (with subtle fade indicators)
   * Clicking a tab updates the active project context and filters all task sections

5. **Main Content Area** (__@src/components/app/main-content.tsx__)
   * Receives the active project context from tab bar
   * Renders child route content (task sections)
   * Proper scrolling behavior: main content scrolls independently of sidebar

6. **Keyboard Shortcuts**
   * `Cmd/Ctrl + K` → Open Quick Find (see T09)
   * `Cmd/Ctrl + \` → Toggle sidebar
   * `N` or `Q` → Focus Add Task input (when not in a text field)

### Out of Scope

* Quick Find implementation (covered in T09)
* Task sections content (covered in T07)
* Settings page (future ticket)
* Notifications system (future)

## Acceptance Criteria

* App layout renders correctly with sidebar, header, tab bar, and main content area
* Sidebar expands and collapses smoothly with animation
* Slim Mode shows only icons with tooltips on hover
* Keyboard shortcut `Cmd/Ctrl + \` toggles the sidebar
* All sidebar navigation items are present and clickable (Today, Upcoming, Someday, Projects, Filters, Activity, Settings)
* Active sidebar item is visually highlighted
* Project tab bar shows "All" tab and one tab per user project
* Clicking a project tab updates the active project context
* "+" button in tab bar triggers project creation flow (inline name input)
* Tab bar scrolls horizontally when many projects exist
* Header shows sidebar toggle, app name, Quick Find trigger, and profile avatar
* Profile avatar dropdown shows user info and "Sign Out" that works correctly
* Layout is responsive: sidebar becomes an overlay drawer on mobile (< 768px)
* Sidebar state (expanded/collapsed) persists across page navigations (stored in local state or cookie)
* Smooth transitions throughout — no janky layout shifts

## Technical Notes

* Use Shadcn's `Sheet` component for mobile sidebar overlay
* For the sidebar collapse animation, use CSS transitions on `width` and `opacity` for labels
* The project tab bar can use Shadcn's `Tabs` component, customized for horizontal scrolling
* Store the active project ID in URL search params or a React context — this allows deep-linking to specific project views
* Use TanStack DB's `useProjects()` live query to populate both the sidebar project list and the tab bar
* For keyboard shortcuts, use a global keyboard event listener (consider a small library like `hotkeys-js` or build a custom hook)
* Consider `ResizeObserver` for responsive sidebar behavior rather than media queries alone
* The sidebar width values: expanded ~240px, collapsed ~60px. Use CSS custom properties for easy theming.

## Dependencies

T01 (Project Scaffolding) — Shadcn components and Tailwind.
T03 (Authentication) — Clerk for profile avatar and route protection.
T02 (Database Schema) — TanStack DB queries for projects list.
