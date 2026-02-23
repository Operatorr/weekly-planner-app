import { useState } from "react";
import type { Task } from "@/lib/types";
import { getWeekDays, getWeekRange } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WeeklyViewProps {
  tasks: Task[];
}

function DraggableWeekTask({
  task,
  onClick,
}: {
  task: Task;
  onClick: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded-[8px] text-xs text-ink-light truncate transition-colors",
        "hover:bg-bone/60",
        isDragging && "shadow-md bg-surface-raised"
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full border-[1.5px] border-clay-light flex-shrink-0" />
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
}

function DayColumn({
  day,
  tasks,
  onTaskClick,
}: {
  day: { label: string; date: string; isToday: boolean };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const droppableId = `week-${day.date}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[12px] border transition-colors min-h-[180px]",
        isOver && "border-ember/40 bg-ember/[0.05]",
        day.isToday
          ? "border-ember/20 bg-ember/[0.02]"
          : "border-border-subtle bg-surface-raised/50 hover:border-border"
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          "px-2.5 py-2 text-center border-b",
          day.isToday ? "border-ember/10" : "border-border-subtle/60"
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
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="p-1 space-y-0.5">
          {tasks.map((task) => (
            <DraggableWeekTask
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center py-4">
              <span className="text-[10px] text-clay/40">
                &mdash;
              </span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function WeeklyView({ tasks }: WeeklyViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks: allTasks } = useTaskContext();
  const weekDays = getWeekDays();
  const weekRange = getWeekRange();

  // Sync selectedTask with latest data
  const currentSelectedTask = selectedTask
    ? allTasks.find((t) => t.id === selectedTask.id) || null
    : null;

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
          <button
            aria-label="Previous week"
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Next week"
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Week grid */}
      <div className="px-4">
        <div className="grid grid-cols-7 gap-1.5 min-h-[200px]">
          {weekDays.map((day) => {
            const dayTasks = tasks.filter(
              (t) => t.due_date === day.date && t.status !== "completed"
            );

            return (
              <DayColumn
                key={day.date}
                day={day}
                tasks={dayTasks}
                onTaskClick={setSelectedTask}
              />
            );
          })}
        </div>
      </div>

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
