import { useState } from "react";
import type { Task } from "@/lib/mock-data";
import { getWeekDays, getWeekRange } from "@/lib/mock-data";
import { TaskItem } from "@/components/app/task-item";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyViewProps {
  tasks: Task[];
  onToggleTask?: (id: string) => void;
}

export function WeeklyView({ tasks, onToggleTask }: WeeklyViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const weekDays = getWeekDays();
  const weekRange = getWeekRange();

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-clay">
            This Week
          </h2>
          <span className="text-xs text-clay">{weekRange}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="px-4">
        <div className="grid grid-cols-7 gap-1.5 min-h-[200px]">
          {weekDays.map((day) => {
            const dayTasks = tasks.filter(
              (t) => t.dueDate === day.date && !t.completed
            );

            return (
              <div
                key={day.date}
                className={cn(
                  "rounded-[12px] border transition-colors min-h-[180px]",
                  day.isToday
                    ? "border-ember/20 bg-ember/[0.02]"
                    : "border-border-subtle bg-surface-raised/50 hover:border-border"
                )}
              >
                {/* Day header */}
                <div
                  className={cn(
                    "px-2.5 py-2 text-center border-b",
                    day.isToday
                      ? "border-ember/10"
                      : "border-border-subtle/60"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      day.isToday ? "text-ember" : "text-ink-muted"
                    )}
                  >
                    {day.label}
                  </span>
                  {day.isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-ember mx-auto mt-1" />
                  )}
                </div>

                {/* Day tasks */}
                <div className="p-1 space-y-0.5">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded-[8px] text-xs text-ink-light truncate transition-colors",
                        "hover:bg-bone/60"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border-[1.5px] border-clay-light flex-shrink-0" />
                        <span className="truncate">{task.name}</span>
                      </div>
                    </button>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center py-4">
                      <span className="text-[10px] text-clay/40">
                        &mdash;
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
