# Ticket T09: Quick Find, Filter Views & Activity History

## Overview

Implement three secondary features that complete the Marrow Tasker MVP experience: Quick Find (instant search across tasks and projects), Filter Views (saved search configurations), and Activity History (chronological log of user actions). These features add polish and power-user capabilities that distinguish Marrow Tasker from a basic to-do app.

**References**: __@Epic Brief: Marrow Tasker__ (Filter Views, Activity History features), __@Core Flows: Marrow Tasker__ (F3.2 Quick Find, F2.3 Filter Views, F2.4 Activity History)

## Scope

### In Scope

1. **Quick Find / Command Palette** (__@src/components/app/quick-find.tsx__)
   * Triggered by: Cmd/Ctrl + K shortcut, or clicking the search icon in the header
   * UI: Shadcn `Command` component (command palette style)
     - Search input at top, auto-focused
     - Results grouped: "Tasks" section, "Projects" section
     - Each result shows: icon, name, subtitle (project name for tasks, task count for projects)
   * Search logic: filters from TanStack DB local data (instant, no server round-trip)
     - Fuzzy matching on task name and description
     - Exact/partial matching on project names
   * Selecting a task → opens the task detail sheet
   * Selecting a project → switches to that project tab
   * Keyboard navigation: arrow keys to navigate results, Enter to select, Escape to close
   * Empty state: "No results found for '{query}'"
   * Recent searches or suggested actions (stretch goal)

2. **Filter Views** (__@src/components/app/filter-panel.tsx__)
   * Access: "Filters" section in sidebar + a filter icon in the task list header
   * Filter panel (slide-out sheet or popover) with filter options:
     - **Date range**: Today, This Week, Next Week, Custom Range (date picker)
     - **Project**: dropdown to select specific project or "All"
     - **Status**: Active, Completed, All
     - **Has Reminder**: Yes, No, Any
   * Live preview: as filters are configured, the task list updates in real-time
   * Save filter: "Save as Filter View" button → name input → saves configuration
   * Saved filters appear in the sidebar under "Filters" heading
   * Clicking a saved filter applies it instantly
   * Free tier limit: 1 saved filter view. Attempting to create a 2nd shows upgrade prompt.
   * Edit/delete saved filters via context menu

3. **Activity History** (__@src/routes/app/activity.tsx__)
   * Access: "Activity" link in sidebar
   * Displays a chronological feed of recent actions:
     - Task created (icon: plus, shows task name)
     - Task completed (icon: check, shows task name)
     - Task edited (icon: pencil, shows task name and what changed)
     - Task deleted (icon: trash, shows task name)
     - Project created/renamed/deleted (icon: folder, shows project name)
   * Each entry shows: action icon, description, timestamp (relative: "2 hours ago", "Yesterday")
   * Free tier: entries limited to last 7 days
   * Entries older than 7 days: show a blurred/locked section with "Upgrade to Pro for unlimited history" message
   * Empty state: "No activity yet. Start by adding a task!"
   * Infinite scroll or "Load more" for longer histories
   * Data source: `activity_log` table via TanStack DB live query

### Out of Scope

* Tag-based search/filtering (future feature)
* Advanced filter operators (AND/OR/NOT combinations) — future
* Activity export (CSV/PDF) — future
* Activity notifications or digests — future
* Filter sharing between users — future

## Acceptance Criteria

* **Quick Find**: opens with Cmd/Ctrl + K, shows instant search results from local data, keyboard navigation works, selecting a result navigates to it, closes on Escape
* **Filter Views**: filter panel shows all filter options, live preview updates the task list, "Save Filter" creates a named filter, saved filters appear in sidebar, Free tier limit of 1 filter is enforced
* **Activity History**: chronological feed of actions is displayed correctly, entries show the right icons and descriptions, timestamps are relative, 7-day limit is enforced for Free tier with a clear upgrade prompt for older entries
* Search is fast (sub-100ms for local data filtering)
* All three features integrate cleanly with the existing app layout and navigation
* Mobile-responsive: Quick Find is a full-screen modal on mobile, filter panel adapts appropriately

## Technical Notes

* Shadcn's `Command` component is built on `cmdk` — it provides great keyboard navigation and search out of the box. Customize the styling to match the minimal theme.
* For fuzzy search, use a lightweight library like `fuse.js` or implement simple `includes()` matching for MVP. Fuse.js adds ~5KB gzipped and provides solid fuzzy matching.
* Filter Views store their configuration as JSON in the `filter_views` table. The `FilterConfig` type should be: `{ dateRange?: { start: Date, end: Date } | 'today' | 'thisWeek' | 'nextWeek', projectId?: string, status?: 'active' | 'completed' | 'all', hasReminder?: boolean }`
* For activity history, the `activity_log` table should have an index on `(user_id, created_at DESC)` for efficient time-range queries.
* The 7-day limit for Free tier can be enforced client-side (TanStack DB query with date filter) and server-side (query `WHERE created_at >= NOW() - INTERVAL '7 days'`). Show a count of hidden entries: "12 more entries from previous weeks (Pro)"
* For relative timestamps, use `date-fns/formatDistanceToNow` or a small utility function.
* Quick Find should debounce the search input (~150ms) to avoid excessive filtering on fast typing.

## Dependencies

T01 (Project Scaffolding) — Shadcn Command component.
T02 (Database Schema) — filter_views and activity_log tables.
T04 (Server Functions) — filter and activity server functions.
T06 (App Layout) — sidebar integration for filters and activity.
T07 (Task Management UI) — task detail sheet for search result navigation.
