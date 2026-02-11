# Ticket T07: Task Management UI — Four-Section View

## Overview

Build the core task management interface — the heart of Marrow Tasker. This is the main view users interact with daily. It consists of four sections: Add Task input, Task List (undated/overdue/today), Weekly View (Mon–Sun columns), and Future Tasks. This ticket implements the visual components, task rendering, section logic, and drag-and-drop interactions. It's the largest and most critical UI ticket.

**References**: __@Epic Brief: Marrow Tasker__ (Task Management — Core UI), __@Core Flows: Marrow Tasker__ (F1.5 Create Task, F1.6 View Tasks, F1.7 Edit Task, F1.8 Complete Task, F1.9 Delete Task, F1.10 Reorder Tasks)

## Scope

### In Scope

1. **Section 1: Add Task Bar** (__@src/components/app/add-task.tsx__)
   * Persistent inline form at the top of the main content area
   * Collapsed state: single-line input with placeholder "Add a task..." and a "+" icon
   * Expanded state (on focus/click): reveals full form:
     - Task name (text input, required, auto-focused)
     - Description (expandable textarea, optional)
     - Date picker (calendar popover, default: no date)
     - Reminder selector (dropdown: None / Email Reminder / Add to Calendar, with time picker when applicable)
     - Project selector (dropdown, pre-filled with active project tab)
   * "Add Task" button and keyboard shortcut Enter to submit
   * Shift+Enter for newline in description
   * Form resets after submission, stays expanded for rapid entry
   * Escape closes/collapses the form
   * Optimistic task creation via TanStack DB

2. **Task Item Component** (__@src/components/app/task-item.tsx__)
   * Reusable component used across all sections
   * Layout: checkbox (left), task name + metadata (center), actions (right)
   * Checkbox: circular, custom styled, satisfying check animation on click
   * Task name: truncated if too long, full name on hover/click
   * Metadata row: date badge (color-coded: red for overdue, blue for today, gray for future), project badge (in "All" view), reminder icon, checklist progress ("2/5")
   * Click on task name → opens task detail sheet (see below)
   * Hover state: subtle background highlight, action icons appear (edit, delete, drag handle)
   * Completed state: checkmark filled, text strikethrough, reduced opacity, fade-out after delay
   * Context menu (right-click): Edit, Complete, Set Date, Move to Project, Delete

3. **Task Detail Sheet** (__@src/components/app/task-detail.tsx__)
   * Things-inspired: task item smoothly expands into a clean white card/sheet overlay
   * Editable fields: task name, description (rich textarea), date picker, reminder, project
   * Checklist section: add/edit/delete/reorder checklist items inline
   * Auto-save: changes debounced at 500ms, saved via TanStack DB optimistic mutations
   * Close: click outside, Escape key, or explicit close button
   * Delete button at the bottom of the sheet
   * Smooth open/close animation (scale + opacity transition)

4. **Section 2: Task List** (__@src/components/app/task-list.tsx__)
   * Title: "Tasks" or contextual (e.g., "Today" if Today view is active)
   * Contains: tasks with no date, tasks with overdue due dates, tasks due today
   * Sort order: newest first (FIFO), but user can manually reorder via drag-and-drop
   * Overdue tasks: date badge shows in red with "Overdue" or the past date
   * Today's tasks: date badge shows "Today" in blue
   * Undated tasks: no date badge, just the task name and metadata
   * Empty state: subtle illustration or text "No tasks here. Add one above!"
   * Section header with task count badge

5. **Section 3: Weekly View** (__@src/components/app/weekly-view.tsx__)
   * Title: "This Week" with date range (e.g., "Feb 9 – Feb 15")
   * Seven columns: Monday through Sunday
   * Each column header: day abbreviation + date number (e.g., "Mon 9"), today's column highlighted
   * Tasks placed in their due date's column
   * Drag between columns to reschedule (changes the due date)
   * Drag from Section 2 into a day column to set a date
   * Columns have a minimum height; empty columns show a subtle drop target
   * On mobile: horizontal scroll or swipeable day view (one day at a time)
   * Navigation: "< Previous Week" and "Next Week >" arrows to browse other weeks

6. **Section 4: Future Tasks** (__@src/components/app/future-tasks.tsx__)
   * Title: "Later" or "Upcoming"
   * Contains tasks with due dates beyond the current week's Sunday
   * Grouped by week or by date with date headers
   * Collapsible sections (one per week or date group)
   * Default: collapsed with task count, expandable on click
   * Drag tasks into this section (sets date to next Monday by default, or specific date via sub-group)

7. **Drag and Drop System** (__@src/lib/dnd.ts__)
   * Library: `@dnd-kit/core` + `@dnd-kit/sortable` (or similar, compatible with React)
   * Within Section 2: reorder tasks (update sort_order)
   * Within Section 3: reorder within a day column
   * Between Section 3 columns: move task to different day (update due_date)
   * From Section 2 → Section 3 column: set due_date to that day
   * From Section 3 → Section 2: remove due_date
   * Visual feedback: lift animation, drop indicator line, smooth settle animation
   * Accessibility: keyboard-based reordering as fallback

8. **Task Completion Flow**
   * Click checkbox → animate check → strikethrough + fade → brief delay → remove from list
   * Toast notification: "Task completed" with "Undo" button (5-second window)
   * Undo restores task to exact previous position
   * "Show Completed" toggle at the bottom of the task list to reveal completed tasks

### Out of Scope

* Board/Kanban layout (future, Pro-adjacent feature)
* Calendar layout (Pro tier)
* Task duration fields (Pro tier)
* Deadline indicators (Pro tier)
* Task Assist AI (Pro tier)
* Bulk operations / multi-select (future)
* Natural language date parsing in quick add (stretch goal, not required for MVP)

## Acceptance Criteria

* **Add Task**: inline form creates tasks with name, description, date, reminder, and project. New tasks appear at the top of the correct section instantly (optimistic).
* **Task Item**: renders with checkbox, name, date badge (color-coded), project badge, reminder icon, and checklist progress. Click opens detail sheet. Hover shows action icons.
* **Task Detail Sheet**: opens smoothly, shows all editable fields, auto-saves on change, closes cleanly. Checklist items can be added, checked, and reordered.
* **Section 2 (Task List)**: correctly filters to show undated, overdue, and today tasks. Supports manual reorder via drag-and-drop.
* **Section 3 (Weekly View)**: displays Mon–Sun columns with correct dates, tasks in correct day columns, today highlighted. Drag between columns reschedules tasks.
* **Section 4 (Future Tasks)**: shows tasks beyond this week, grouped by week/date, collapsible sections.
* **Drag and Drop**: works within sections, between sections, and between weekly columns. Sort order and dates are updated correctly. Visual feedback is smooth.
* **Task Completion**: checkbox animation, strikethrough, fade-out, undo toast — all working.
* **Empty States**: each section shows appropriate empty state when no tasks match.
* **Project Filtering**: switching project tabs correctly filters all four sections.
* **Performance**: 100+ tasks renders without jank. Drag-and-drop remains smooth.
* **Responsive**: mobile layout adapts weekly view to single-day swipe, sections stack vertically.

## Technical Notes

* Use `@dnd-kit` for drag-and-drop — it's the most modern, accessible, and performant React DnD library. Use `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`.
* TanStack DB live queries drive all section data. Create derived queries that filter by date ranges (use `startOfWeek()`, `endOfWeek()`, `startOfDay()`, `isToday()`, `isPast()` date utils).
* For the task detail sheet, use Shadcn's `Sheet` component (slides in from the right) or a custom expanding card animation.
* Date picker: use Shadcn's `Calendar` + `Popover` components.
* For the weekly view columns, use CSS Grid (`grid-template-columns: repeat(7, 1fr)`) on desktop. On mobile, use a horizontal scroll snap.
* Task sort order: use fractional indexing. When a task is dropped between positions A (order: 1.0) and B (order: 2.0), assign order 1.5. Use a library like `fractional-indexing` for robustness.
* The "completed task fade-out" should use a combination of CSS transitions and a `setTimeout` to remove from the DOM after the animation.
* For the undo toast, use Shadcn's `Toast` component with a custom "Undo" action button. Store the task's previous state in a ref and restore it on undo.
* Consider virtualization (e.g., `@tanstack/react-virtual`) for the task list if performance becomes an issue with many tasks.
* Animations should be 200-300ms, using `ease-out` curves. Keep them subtle — this is a productivity app, not a game.

## Dependencies

T01 (Project Scaffolding) — Shadcn components, Tailwind.
T02 (Database Schema) — TanStack DB collections and live queries.
T04 (Server Functions) — CRUD operations for tasks.
T06 (App Layout) — layout shell, project tab context.
