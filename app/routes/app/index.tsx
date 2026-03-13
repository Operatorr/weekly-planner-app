/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useCallback, useState } from "react";
import { useAppContext } from "@/lib/app-context";
import {
  useTaskContext,
  isToday,
  isPast,
  isBeyondThisWeek,
  normalizeDate,
  todayStr,
  startOfWeekStr,
  endOfWeekStr,
} from "@/lib/task-context";
import { AddTask } from "@/components/app/add-task";
import { TaskList } from "@/components/app/task-list";
import { TaskItem } from "@/components/app/task-item";
import { WeeklyView } from "@/components/app/weekly-view";
import { FutureTasks } from "@/components/app/future-tasks";
import type { Task } from "@/lib/types";
import { useProjects } from "@/hooks/use-projects";
import { Separator } from "@/components/ui/separator";
import { TaskListSkeleton, WeeklyViewSkeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  type DragCancelEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export const Route = createFileRoute("/app/")({
  component: TaskManagement,
});

function ActiveFilterBanner({
  activeFilter,
  onClear,
  onOpen,
}: {
  activeFilter: import("@/components/app/filter-panel").FilterConfig;
  onClear: () => void;
  onOpen: () => void;
}) {
  const labels: string[] = [];
  if (activeFilter.dateRange && activeFilter.dateRange !== "all") {
    const map: Record<string, string> = {
      today: "Today",
      throughToday: "Through Today",
      overdue: "Overdue",
      thisWeek: "This Week",
      nextWeek: "Next Week",
    };
    labels.push(map[activeFilter.dateRange] || activeFilter.dateRange);
  }
  if (activeFilter.status && activeFilter.status !== "all") {
    labels.push(activeFilter.status === "completed" ? "Completed" : "Active");
  }
  if (activeFilter.projectId) {
    labels.push("Project");
  }
  if (activeFilter.hasReminder && activeFilter.hasReminder !== "any") {
    labels.push(activeFilter.hasReminder === "yes" ? "Has Reminder" : "No Reminder");
  }

  if (labels.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ember/8 text-ember text-xs font-medium border border-ember/20 hover:bg-ember/12 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        {labels.join(" · ")}
      </button>
      <button
        onClick={onClear}
        className="text-xs text-clay hover:text-ink transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

function TaskManagement() {
  const { activeProject, activeView, activeFilter, setActiveFilter, setFilterPanelOpen } = useAppContext();
  const { tasks, updateTask, reorderTasks, isLoading } = useTaskContext();
  const { data: projects = [] } = useProjects();
  const reducedMotion = useReducedMotion();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Framer Motion values for smooth drag animations
  const dragRotation = useMotionValue(0);
  const dragScale = useSpring(1, { stiffness: 400, damping: 30 });
  const [insertionInfo, setInsertionInfo] = useState<{
    overId: string;
    position: 'before' | 'after';
  } | null>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const dateString = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Framer Motion drag animation handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      // Extract real task ID (weekly view tasks have "week-task-" prefix)
      const activeId = (active.id as string).startsWith("week-task-")
        ? (active.id as string).replace("week-task-", "")
        : (active.id as string);
      const task = tasks.find((t) => t.id === activeId);
      setActiveTask(task || null);

      if (reducedMotion) return;

      // Animate scale up with spring
      dragScale.set(1.02);
      dragRotation.set(1);
    },
    [reducedMotion, tasks, dragScale, dragRotation]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (reducedMotion) return;

      const { delta } = event;
      // Dynamic rotation based on horizontal movement - instant update, no tween
      const rotation = Math.min(Math.max(delta.x * 0.015, -2), 2);
      dragRotation.set(rotation);
    },
    [reducedMotion, dragRotation]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over, active } = event;

      // If no over element (pointer in gap), keep showing last position - don't blink
      if (!over) return;

      // Dragging over itself - no indicator needed
      if (over.id === active.id) {
        setInsertionInfo(null);
        return;
      }

      // Only show insertion indicator for task-to-task reordering
      const overId = over.id as string;
      // Allow week-task- (weekly view tasks) but not week- (date columns)
      const isWeekColumn = overId.startsWith("week-") && !overId.startsWith("week-task-");
      if (
        typeof overId === "string" &&
        !isWeekColumn &&
        !overId.startsWith("sidebar-") &&
        overId !== "tasklist-drop"
      ) {
        // Get pointer position from the event
        const activatorEvent = event.activatorEvent as PointerEvent;
        const pointerY = activatorEvent.clientY + event.delta.y;
        const overRect = over.rect;
        const midpoint = overRect.top + overRect.height / 2;

        setInsertionInfo({
          overId,
          position: pointerY < midpoint ? "before" : "after",
        });
      } else {
        // Dragging over non-task elements (sidebar, week columns, etc.)
        setInsertionInfo(null);
      }
    },
    []
  );

  const resetDragAnimation = useCallback(() => {
    setActiveTask(null);
    setInsertionInfo(null);

    if (reducedMotion) return;

    // Reset motion values - spring will animate smoothly
    dragScale.set(1);
    dragRotation.set(0);
  }, [reducedMotion, dragScale, dragRotation]);

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      resetDragAnimation();
    },
    [resetDragAnimation]
  );

  // Check if a non-trivial filter is active
  const isFilterActive =
    (activeFilter.status && activeFilter.status !== "all") ||
    activeFilter.projectId !== undefined ||
    (activeFilter.dateRange && activeFilter.dateRange !== "all") ||
    (activeFilter.hasReminder && activeFilter.hasReminder !== "any");

  // Filter tasks by active project and view
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by project
    if (activeProject !== "all") {
      result = result.filter((t) => t.project_id === activeProject);
    }

    // Filter by view (skip when a filter is active — show all tasks for filtering)
    if (!isFilterActive) {
      switch (activeView) {
        case "today":
          result = result.filter(
            (t) =>
              !t.is_someday &&
              (
                (t.due_date && (isToday(t.due_date) || isPast(t.due_date))) ||
                !t.due_date
              )
          );
          break;
        case "upcoming":
          result = result.filter(
            (t) =>
              t.due_date &&
              !isToday(t.due_date) &&
              !isPast(t.due_date)
          );
          break;
        case "someday":
          result = result.filter((t) => t.is_someday);
          break;
        case "inbox":
        default:
          break;
      }
    }

    // Apply activeFilter
    if (activeFilter.status && activeFilter.status !== "all") {
      result = result.filter((t) =>
        activeFilter.status === "completed"
          ? t.status === "completed"
          : t.status !== "completed"
      );
    }

    if (activeFilter.projectId) {
      result = result.filter((t) => t.project_id === activeFilter.projectId);
    }

    if (activeFilter.dateRange && activeFilter.dateRange !== "all") {
      const today = todayStr();
      const weekStart = startOfWeekStr();
      const weekEnd = endOfWeekStr();

      result = result.filter((t) => {
        const d = t.due_date ? normalizeDate(t.due_date) : null;

        switch (activeFilter.dateRange) {
          case "today":
            return d === today;
          case "throughToday":
            return !d || d <= today;
          case "overdue":
            return d !== null && d < today;
          case "thisWeek":
            return d !== null && d >= weekStart && d <= weekEnd;
          case "nextWeek": {
            if (!d) return false;
            const nextWeekStart = new Date(weekEnd + "T12:00:00");
            nextWeekStart.setDate(nextWeekStart.getDate() + 1);
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
            const nws = nextWeekStart.toISOString().split("T")[0];
            const nwe = nextWeekEnd.toISOString().split("T")[0];
            return d >= nws && d <= nwe;
          }
          default:
            return true;
        }
      });
    }

    return result;
  }, [tasks, activeProject, activeView, activeFilter, isFilterActive]);

  // Weekly view tasks: project-filtered only (not view-filtered) for this week's tasks
  const weeklyViewTasks = useMemo(() => {
    let result = tasks;

    // Filter by project only
    if (activeProject !== "all") {
      result = result.filter((t) => t.project_id === activeProject);
    }

    return result.filter((t) => t.due_date && t.status !== "completed");
  }, [tasks, activeProject]);

  // Determine which sections to show based on view (hide when filter active)
  const showWeeklyView = !isFilterActive && activeView === "today";
  const showFutureTasks = !isFilterActive && activeView === "today";

  // Section 2: Tasks to show in the main task list
  // For upcoming/someday: show all filtered tasks (already filtered by view)
  // For today/inbox: show undated + overdue + today
  // IMPORTANT: Must match the sort order used in TaskList for drag-to-reorder to work correctly
  const section2Tasks = useMemo(() => {
    let result: Task[];

    if (isFilterActive) {
      // When filter is active, show all filtered results in one flat list
      result = filteredTasks;
    } else if (activeView === "upcoming") {
      // Upcoming: show all filtered tasks sorted by date (chronological)
      result = [...filteredTasks].sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    } else if (activeView === "someday") {
      // Someday: show all filtered tasks (already filtered to is_someday)
      result = filteredTasks;
    } else if (activeView === "inbox") {
      // Inbox: the complete backlog — all tasks, no date filtering
      result = filteredTasks;
    } else {
      // Today: undated + overdue + today only
      result = filteredTasks.filter(
        (t) =>
          !t.due_date ||
          isToday(t.due_date) ||
          (isPast(t.due_date) && !isToday(t.due_date))
      );
    }

    // Sort to match TaskList's visual order: overdue first, then by sort_order
    return [...result].sort((a, b) => {
      if (a.due_date && b.due_date) {
        if (isPast(a.due_date) && !isPast(b.due_date)) return -1;
        if (!isPast(a.due_date) && isPast(b.due_date)) return 1;
      }
      return a.sort_order - b.sort_order;
    });
  }, [filteredTasks, activeView, isFilterActive]);

  // Section 4: beyond this week (project-filtered only, bypasses view filter like weeklyViewTasks)
  const section4Tasks = useMemo(() => {
    let result = tasks;

    if (activeProject !== "all") {
      result = result.filter((t) => t.project_id === activeProject);
    }

    if (isFilterActive) return [];

    return result.filter(
      (t) => t.due_date && isBeyondThisWeek(t.due_date) && t.status !== "completed"
    );
  }, [tasks, activeProject, isFilterActive]);

  const activeSection2Count = section2Tasks.filter((t) => t.status !== "completed").length;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      // Reset GSAP animations
      resetDragAnimation();

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const rawActiveId = active.id as string;
      const overId = over.id as string;

      // Extract real task ID (weekly view tasks have "week-task-" prefix)
      const activeId = rawActiveId.startsWith("week-task-")
        ? rawActiveId.replace("week-task-", "")
        : rawActiveId;

      // Check if dropping onto a week column (droppable id starts with "week-" but NOT "week-task-")
      if (typeof overId === "string" && overId.startsWith("week-") && !overId.startsWith("week-task-")) {
        const newDate = overId.replace("week-", "");
        updateTask(activeId, { due_date: newDate, is_someday: false });
        return;
      }

      // Check if dropping onto sidebar nav items
      if (typeof overId === "string" && overId.startsWith("sidebar-")) {
        const view = overId.replace("sidebar-", "");

        switch (view) {
          case "today":
            // Move to today (clear due date so it appears in Today section, clear someday)
            updateTask(activeId, { due_date: null, is_someday: false });
            break;
          case "someday":
            // Move to someday (clear due date, set someday flag)
            updateTask(activeId, { due_date: null, is_someday: true });
            break;
        }
        return;
      }

      // Check if dropping onto the task list (remove due date)
      if (overId === "tasklist-drop") {
        const draggedTask = tasks.find((t) => t.id === activeId);
        if (draggedTask?.due_date && !isToday(draggedTask.due_date) && !isPast(draggedTask.due_date)) {
          updateTask(activeId, { due_date: null, is_someday: false });
        }
        return;
      }

      // Extract real task ID from overId (weekly view tasks have "week-task-" prefix)
      const realOverId = overId.startsWith("week-task-")
        ? overId.replace("week-task-", "")
        : overId;

      // Reorder within same section
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === realOverId);
      if (!activeTask || !overTask) return;

      // Check if dragging from weekly view into section2 (today's task list)
      const section2Ids = new Set(section2Tasks.map((t) => t.id));
      const isDropOnSection2 = section2Ids.has(realOverId);
      const isDraggingFromWeekly = activeTask.due_date &&
        !isToday(activeTask.due_date) &&
        !isPast(activeTask.due_date);

      if (isDropOnSection2 && isDraggingFromWeekly) {
        // Cross-section drop: clear date AND set position
        const incompleteTasks = section2Tasks.filter(t => t.status !== "completed");
        const overIdx = incompleteTasks.findIndex((t) => t.id === realOverId);

        // Build new task order with the dragged task inserted at drop position
        const newTaskIds = incompleteTasks.map(t => t.id);
        newTaskIds.splice(overIdx, 0, activeId);

        // Update the dragged task's date to make it undated
        updateTask(activeId, { due_date: null, is_someday: false });

        // Reorder all tasks to maintain positions
        const orders = newTaskIds.map((_, i) => i);
        reorderTasks(newTaskIds, orders);
        return;
      }

      // Determine which section to reorder in based on the over task
      let sectionTasks: typeof tasks = [];

      // Check section 2 (undated + today + overdue)
      if (section2Ids.has(realOverId)) {
        sectionTasks = section2Tasks.filter((t) => t.status !== "completed");
      }
      // Check weekly view tasks (this week)
      const weeklyViewIds = new Set(weeklyViewTasks.map((t) => t.id));
      if (weeklyViewIds.has(realOverId)) {
        sectionTasks = weeklyViewTasks.filter((t) => t.status !== "completed");
      }
      // Check section 4 (beyond this week)
      const section4Ids = new Set(section4Tasks.map((t) => t.id));
      if (section4Ids.has(realOverId)) {
        sectionTasks = section4Tasks.filter((t) => t.status !== "completed");
      }

      if (sectionTasks.length === 0) return;

      const activeIdx = sectionTasks.findIndex((t) => t.id === activeId);
      const overIdx = sectionTasks.findIndex((t) => t.id === realOverId);

      if (activeIdx !== -1 && overIdx !== -1) {
        const reordered = arrayMove(sectionTasks, activeIdx, overIdx);
        const ids = reordered.map((t) => t.id);
        const orders = reordered.map((_, i) => i);
        reorderTasks(ids, orders);
      }
    },
    [tasks, section2Tasks, weeklyViewTasks, section4Tasks, updateTask, reorderTasks, resetDragAnimation]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="max-w-[960px] mx-auto py-6 px-4 space-y-8">
        {/* Welcome heading */}
        <div className="px-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            {greeting}
          </h1>
          <p className="text-sm text-ink-muted mt-1">{dateString}</p>
        </div>

        {/* Active filter indicator */}
        {isFilterActive && (
          <ActiveFilterBanner
            activeFilter={activeFilter}
            onClear={() => setActiveFilter({})}
            onOpen={() => setFilterPanelOpen(true)}
          />
        )}

        {/* Section 1: Add Task */}
        <AddTask />

        {isLoading ? (
          <>
            {/* Loading skeletons */}
            <TaskListSkeleton count={4} />
            {showWeeklyView && (
              <>
                <div className="px-4">
                  <Separator />
                </div>
                <WeeklyViewSkeleton />
              </>
            )}
          </>
        ) : (
          <>
            {/* Section 2: Task List (undated, overdue, today) */}
            <TaskList
              tasks={section2Tasks}
              title="Tasks"
              count={activeSection2Count}
              insertionInfo={insertionInfo}
              projects={projects}
              showProject={activeView === "inbox" || activeView === "today"}
              alwaysShowCompleted={activeView === "inbox"}
            />

            {showWeeklyView && (
              <>
                <div className="px-4">
                  <Separator />
                </div>

                {/* Section 3: Weekly View */}
                <WeeklyView tasks={weeklyViewTasks} />
              </>
            )}

            {showFutureTasks && (
              <>
                <div className="px-4">
                  <Separator />
                </div>

                {/* Section 4: Future Tasks */}
                <FutureTasks tasks={section4Tasks} projects={projects} />
              </>
            )}
          </>
        )}

        {/* Bottom padding */}
        <div className="h-16" />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <motion.div
            data-drag-overlay
            style={{
              scale: dragScale,
              rotate: dragRotation,
              boxShadow: "0 12px 40px rgba(44, 40, 37, 0.12)",
            }}
          >
            <TaskItem task={activeTask} sortable={false} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5 || hour >= 21) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
