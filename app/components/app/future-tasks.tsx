import { useState } from "react";
import type { Task } from "@/lib/types";
import { useTaskContext } from "@/lib/task-context";
import { TaskItem } from "@/components/app/task-item";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface FutureTasksProps {
  tasks: Task[];
}

export function FutureTasks({ tasks }: FutureTasksProps) {
  const { completeTask, uncompleteTask, deleteTask, getChecklist, tasks: allTasks } = useTaskContext();
  const [expanded, setExpanded] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const activeTasks = tasks.filter((t) => t.status !== "completed");

  // Group by week
  const grouped = activeTasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.due_date) return acc;
    const d = new Date(task.due_date.split("T")[0] + "T12:00:00");
    if (isNaN(d.getTime())) return acc;
    const weekStart = new Date(d);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const key = weekStart.toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(grouped).sort();

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
    ? allTasks.find((t) => t.id === selectedTask.id) || null
    : null;

  if (activeTasks.length === 0) return null;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 group"
        >
          <ChevronRight
            size={14}
            className={cn(
              "text-clay transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
          <h2 className="text-xs font-semibold tracking-wider uppercase text-clay group-hover:text-ink-muted transition-colors">
            Later
          </h2>
          <span className="text-xs text-clay bg-bone rounded-full px-1.5 py-0.5">
            {activeTasks.length}
          </span>
        </button>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="animate-fade-up px-1">
          {sortedWeeks.map((weekKey) => {
            const weekTasks = grouped[weekKey];
            const weekDate = new Date(weekKey + "T12:00:00");
            const weekEnd = new Date(weekDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const label = `${weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

            return (
              <div key={weekKey} className="mb-4">
                <div className="px-4 py-1.5 mb-1">
                  <span className="text-[10px] font-medium text-clay tracking-wider uppercase">
                    Week of {label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {weekTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onClick={setSelectedTask}
                      onDelete={deleteTask}
                      checklistCount={getChecklistCount(task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
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
