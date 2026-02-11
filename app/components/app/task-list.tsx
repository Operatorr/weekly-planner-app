import { useState } from "react";
import type { Task } from "@/lib/mock-data";
import { isToday, isPast } from "@/lib/mock-data";
import { TaskItem } from "@/components/app/task-item";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  title: string;
  count?: number;
  emptyMessage?: string;
  onToggleTask?: (id: string) => void;
}

export function TaskList({
  tasks,
  title,
  count,
  emptyMessage = "No tasks here. Add one above!",
  onToggleTask,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Sort: overdue first, then today, then undated
  const sortedTasks = [...activeTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      if (isPast(a.dueDate) && !isPast(b.dueDate)) return -1;
      if (!isPast(a.dueDate) && isPast(b.dueDate)) return 1;
    }
    return a.sortOrder - b.sortOrder;
  });

  return (
    <section>
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

      {/* Task list */}
      {sortedTasks.length > 0 ? (
        <div className="space-y-0.5 px-1">
          {sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                onClick={setSelectedTask}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-bone mx-auto mb-3 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-clay-light">
              <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-clay">{emptyMessage}</p>
        </div>
      )}

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
                  onToggle={onToggleTask}
                  onClick={setSelectedTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task detail sheet */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </section>
  );
}
