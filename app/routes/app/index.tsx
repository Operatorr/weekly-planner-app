import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { AddTask } from "@/components/app/add-task";
import { TaskList } from "@/components/app/task-list";
import { WeeklyView } from "@/components/app/weekly-view";
import { FutureTasks } from "@/components/app/future-tasks";
import { Separator } from "@/components/ui/separator";
import {
  mockTasks as initialTasks,
  isToday,
  isPast,
  isThisWeek,
  isBeyondThisWeek,
  type Task,
} from "@/lib/mock-data";

export const Route = createFileRoute("/app/")({
  component: TaskManagement,
});

function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed
                ? new Date().toISOString().split("T")[0]
                : undefined,
            }
          : t
      )
    );
  }, []);

  const handleAddTask = useCallback(
    (newTask: { name: string; description?: string }) => {
      const task: Task = {
        id: `t${Date.now()}`,
        name: newTask.name,
        description: newTask.description,
        projectId: "personal",
        completed: false,
        sortOrder: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [task, ...prev]);
    },
    []
  );

  // Section 2: undated + overdue + today
  const section2Tasks = tasks.filter(
    (t) =>
      !t.dueDate ||
      (t.dueDate && isToday(t.dueDate)) ||
      (t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate))
  );

  // Section 3: this week (future days only, not today)
  const section3Tasks = tasks.filter(
    (t) =>
      t.dueDate &&
      isThisWeek(t.dueDate) &&
      !isToday(t.dueDate) &&
      !isPast(t.dueDate) &&
      !t.completed
  );

  // Section 4: beyond this week
  const section4Tasks = tasks.filter(
    (t) => t.dueDate && isBeyondThisWeek(t.dueDate)
  );

  const activeSection2Count = section2Tasks.filter((t) => !t.completed).length;

  return (
    <div className="max-w-[960px] mx-auto py-6 px-4 space-y-8">
      {/* Welcome heading */}
      <div className="px-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          {getGreeting()}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Section 1: Add Task */}
      <AddTask onAdd={handleAddTask} />

      {/* Section 2: Task List (undated, overdue, today) */}
      <TaskList
        tasks={section2Tasks}
        title="Tasks"
        count={activeSection2Count}
        onToggleTask={handleToggleTask}
      />

      <div className="px-4">
        <Separator />
      </div>

      {/* Section 3: Weekly View */}
      <WeeklyView tasks={section3Tasks} onToggleTask={handleToggleTask} />

      <div className="px-4">
        <Separator />
      </div>

      {/* Section 4: Future Tasks */}
      <FutureTasks tasks={section4Tasks} onToggleTask={handleToggleTask} />

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
