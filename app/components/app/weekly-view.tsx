import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import { getWeekDays, getWeekRange, normalizeDate, isPast, isToday } from "@/lib/task-context";
import { useTaskContext } from "@/lib/task-context";
import { TaskDetail } from "@/components/app/task-detail";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { DayExpandPanel } from "@/components/app/day-expand-panel";
import { useSettings } from "@/lib/settings-context";
import { useBackButtonClose } from "@/hooks/use-back-button-close";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";

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
    isDragging,
  } = useSortable({ id: `week-task-${task.id}` });

  // Notion-style: items stay static during drag
  // Don't apply transform/transition - items won't shift around
  const style = {
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const isOverdue = task.due_date && isPast(task.due_date) && !isToday(task.due_date);

  return (
    <button
      ref={setNodeRef}
      data-task-id={task.id}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "task-item w-full text-left px-2 py-1.5 rounded-[8px] text-xs text-ink-light truncate transition-colors cursor-pointer",
        "hover:bg-bone/60",
        isDragging && "bg-surface-raised"
      )}
    >
      <div className="flex items-center justify-center sm:justify-start gap-1.5">
        <div className={cn(
          "w-3 h-3 rounded-full border-[1.5px] flex-shrink-0",
          isOverdue ? "border-ember" : "border-clay-light"
        )} />
        <span className="truncate hidden sm:inline">{task.title}</span>
      </div>
    </button>
  );
}

function DayColumn({
  day,
  tasks,
  onTaskClick,
  onExpand,
}: {
  day: { label: string; date: string; isToday: boolean };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onExpand: () => void;
}) {
  const droppableId = `week-${day.date}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group rounded-[12px] border min-h-[180px] transition-all duration-200",
        day.isToday
          ? "border-ember/20 bg-ember/[0.02]"
          : "border-border-subtle bg-surface-raised/50 hover:border-border",
        // Drop zone highlight
        isOver && "scale-[1.02] border-ember/40 bg-ember/5 shadow-lg shadow-ember/10"
      )}
    >
      {/* Day header */}
      <button
        onClick={onExpand}
        className={cn(
          "w-full px-2.5 py-2 flex items-center justify-center text-center border-b cursor-pointer relative",
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
        <Maximize2
          size={11}
          className="absolute right-2 text-clay opacity-0 group-hover:opacity-60 transition-opacity"
        />
      </button>

      {/* Day tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="p-1 flex flex-col gap-0.5">
          {tasks.map((task) => (
            <DraggableWeekTask
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function WeeklyView({ tasks }: WeeklyViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedDay, setExpandedDay] = useState<{ label: string; date: string } | null>(null);
  const { tasks: allTasks } = useTaskContext();
  const { settings } = useSettings();

  // On mobile, intercept the Android back button to close panels instead of navigating away
  useBackButtonClose("day-expand", !!expandedDay, () => setExpandedDay(null));
  useBackButtonClose("task-detail-weekly", !!selectedTask, () => setSelectedTask(null));
  const weekDays = getWeekDays(weekOffset, settings.weekStartsOn);
  const weekRange = getWeekRange(weekOffset, settings.weekStartsOn);

  // Sync selectedTask with latest data
  const currentSelectedTask = selectedTask
    ? allTasks.find((t) => t.id === selectedTask.id) || null
    : null;

  // Keyboard shortcuts for week navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) return;
      if (e.key === "ArrowLeft") setWeekOffset((w) => w - 1);
      if (e.key === "ArrowRight") setWeekOffset((w) => w + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const weekLabel =
    weekOffset === 0
      ? "This Week"
      : weekOffset === -1
      ? "Last Week"
      : weekOffset === 1
      ? "Next Week"
      : weekRange;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-clay">
            {weekLabel}
          </h2>
          {weekOffset !== 0 && (
            <span className="text-xs text-clay">{weekRange}</span>
          )}
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-bone text-ink-muted hover:bg-bone/80 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous week"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Next week"
            onClick={() => setWeekOffset((w) => w + 1)}
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
              (t) =>
                t.due_date &&
                normalizeDate(t.due_date) === day.date &&
                t.status !== "completed"
            );

            return (
              <DayColumn
                key={day.date}
                day={day}
                tasks={dayTasks}
                onTaskClick={setSelectedTask}
                onExpand={() => setExpandedDay({ label: day.label, date: day.date })}
              />
            );
          })}
        </div>
      </div>

      {/* Day expand panel */}
      {expandedDay && (
        <DayExpandPanel
          day={expandedDay}
          tasks={allTasks.filter(
            (t) => t.due_date && normalizeDate(t.due_date) === expandedDay.date
          )}
          onClose={() => setExpandedDay(null)}
        />
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
