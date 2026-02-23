import { useState, useRef, useEffect } from "react";
import type { Task } from "@/lib/types";
import { isToday, isPast } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import { TaskItem } from "@/components/app/task-item";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface TaskListProps {
  tasks: Task[];
  title: string;
  count?: number;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  title,
  count,
  emptyMessage = "No tasks here. Add one above!",
}: TaskListProps) {
  const { completeTask, uncompleteTask, deleteTask, getChecklist } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTaskId, setNewTaskId] = useState<string | null>(null);
  const prevTaskIdsRef = useRef<Set<string>>(new Set(tasks.map((t) => t.id)));

  const { setNodeRef, isOver } = useDroppable({ id: "tasklist-drop" });

  // Detect newly added tasks for slide-in animation
  useEffect(() => {
    const prevIds = prevTaskIdsRef.current;
    const newTask = tasks.find((t) => !prevIds.has(t.id));
    if (newTask) {
      setNewTaskId(newTask.id);
      const timer = setTimeout(() => setNewTaskId(null), 400);
      return () => clearTimeout(timer);
    }
    prevTaskIdsRef.current = new Set(tasks.map((t) => t.id));
  }, [tasks]);

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  // Sort: overdue first, then today, then undated
  const sortedTasks = [...activeTasks].sort((a, b) => {
    if (a.due_date && b.due_date) {
      if (isPast(a.due_date) && !isPast(b.due_date)) return -1;
      if (!isPast(a.due_date) && isPast(b.due_date)) return 1;
    }
    return a.sort_order - b.sort_order;
  });

  const taskIds = sortedTasks.map((t) => t.id);

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.status === "completed") {
      uncompleteTask(id);
    } else {
      completeTask(id);
    }
  };

  const getChecklistCount = (taskId: string) => {
    const items = getChecklist(taskId);
    if (items.length === 0) return undefined;
    return { done: items.filter((c) => c.is_completed).length, total: items.length };
  };

  // Sync selectedTask with latest data
  const currentSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null;

  return (
    <section ref={setNodeRef}>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-clay">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs text-clay bg-bone rounded-full px-1.5 py-0.5">
              {count}
            </span>
          )}
        </div>
      </div>

      {/* Task list with sortable context */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {sortedTasks.length > 0 ? (
          <div
            className={cn(
              "space-y-0.5 px-1 min-h-[40px] rounded-[12px] transition-colors",
              isOver && "bg-ember/5 border border-dashed border-ember/20"
            )}
          >
            {sortedTasks.map((task, index) => (
              <div
                key={task.id}
                className={task.id === newTaskId ? "animate-slide-in-down" : "animate-fade-up"}
                style={task.id !== newTaskId ? { animationDelay: `${index * 40}ms` } : undefined}
              >
                <TaskItem
                  task={task}
                  onToggle={handleToggle}
                  onClick={setSelectedTask}
                  onDelete={deleteTask}
                  checklistCount={getChecklistCount(task.id)}
                  sortable
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "px-5 py-8 text-center rounded-[12px] transition-colors",
              isOver && "bg-ember/5 border border-dashed border-ember/20"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-bone mx-auto mb-3 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-clay-light">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm text-clay">{emptyMessage}</p>
          </div>
        )}
      </SortableContext>

      {/* Completed tasks toggle */}
      {completedTasks.length > 0 && (
        <div className="mt-3 px-5">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1.5 text-xs text-clay hover:text-ink-muted transition-colors"
          >
            {showCompleted ? <EyeOff size={12} /> : <Eye size={12} />}
            {showCompleted ? "Hide" : "Show"} completed ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-0.5 opacity-60">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onClick={setSelectedTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task detail sheet */}
      {currentSelectedTask && (
        <TaskDetail
          task={currentSelectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </section>
  );
}
