import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppContext } from "@/lib/app-context";
import {
  useTaskContext,
  isToday,
  isPast,
  isThisWeek,
  isBeyondThisWeek,
} from "@/lib/task-context";
import { AddTask } from "@/components/app/add-task";
import { TaskList } from "@/components/app/task-list";
import { WeeklyView } from "@/components/app/weekly-view";
import { FutureTasks } from "@/components/app/future-tasks";
import { Separator } from "@/components/ui/separator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export const Route = createFileRoute("/app/")({
  component: TaskManagement,
});

function TaskManagement() {
  const { activeProject } = useAppContext();
  const { tasks, updateTask, reorderTasks } = useTaskContext();
  const [greeting, setGreeting] = useState("");
  const [dateString, setDateString] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks by active project
  const filteredTasks = useMemo(() => {
    if (activeProject === "all") return tasks;
    return tasks.filter((t) => t.project_id === activeProject);
  }, [tasks, activeProject]);

  useEffect(() => {
    setGreeting(getGreeting());
    setDateString(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Section 2: undated + overdue + today
  const section2Tasks = filteredTasks.filter(
    (t) =>
      !t.due_date ||
      (t.due_date && isToday(t.due_date)) ||
      (t.due_date && isPast(t.due_date) && !isToday(t.due_date))
  );

  // Section 3: this week (future days only, not today)
  const section3Tasks = filteredTasks.filter(
    (t) =>
      t.due_date &&
      isThisWeek(t.due_date) &&
      !isToday(t.due_date) &&
      !isPast(t.due_date) &&
      t.status !== "completed"
  );

  // Section 4: beyond this week
  const section4Tasks = filteredTasks.filter(
    (t) => t.due_date && isBeyondThisWeek(t.due_date)
  );

  const activeSection2Count = section2Tasks.filter((t) => t.status !== "completed").length;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if dropping onto a week column (droppable id starts with "week-")
      if (typeof overId === "string" && overId.startsWith("week-")) {
        const newDate = overId.replace("week-", "");
        updateTask(activeId, { due_date: newDate });
        return;
      }

      // Check if dropping onto the task list (remove due date)
      if (overId === "tasklist-drop") {
        const draggedTask = tasks.find((t) => t.id === activeId);
        if (draggedTask?.due_date && !isToday(draggedTask.due_date) && !isPast(draggedTask.due_date)) {
          updateTask(activeId, { due_date: null });
        }
        return;
      }

      // Reorder within same section
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);
      if (!activeTask || !overTask) return;

      // Find the section the tasks are in
      const sectionTasks = section2Tasks.filter((t) => t.status !== "completed");
      const activeIdx = sectionTasks.findIndex((t) => t.id === activeId);
      const overIdx = sectionTasks.findIndex((t) => t.id === overId);

      if (activeIdx !== -1 && overIdx !== -1) {
        const reordered = arrayMove(sectionTasks, activeIdx, overIdx);
        const ids = reordered.map((t) => t.id);
        const orders = reordered.map((_, i) => i);
        reorderTasks(ids, orders);
      }
    },
    [tasks, section2Tasks, updateTask, reorderTasks]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-[960px] mx-auto py-6 px-4 space-y-8">
        {/* Welcome heading */}
        <div className="px-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            {greeting}
          </h1>
          <p className="text-sm text-ink-muted mt-1">{dateString}</p>
        </div>

        {/* Section 1: Add Task */}
        <AddTask />

        {/* Section 2: Task List (undated, overdue, today) */}
        <TaskList
          tasks={section2Tasks}
          title="Tasks"
          count={activeSection2Count}
        />

        <div className="px-4">
          <Separator />
        </div>

        {/* Section 3: Weekly View */}
        <WeeklyView tasks={section3Tasks} />

        <div className="px-4">
          <Separator />
        </div>

        {/* Section 4: Future Tasks */}
        <FutureTasks tasks={section4Tasks} />

        {/* Bottom padding */}
        <div className="h-16" />
      </div>
    </DndContext>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
