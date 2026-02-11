import { useState } from "react";
import type { Task } from "@/lib/mock-data";
import { formatDate, isToday, isPast } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Bell,
  GripVertical,
  MoreHorizontal,
  Check,
} from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onClick?: (task: Task) => void;
  showProject?: boolean;
  compact?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onClick,
  showProject,
  compact,
}: TaskItemProps) {
  const [completing, setCompleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) return;
    setCompleting(true);
    setTimeout(() => {
      onToggle?.(task.id);
    }, 600);
  };

  const dateBadgeVariant = task.dueDate
    ? isPast(task.dueDate) && !isToday(task.dueDate)
      ? "destructive"
      : isToday(task.dueDate)
        ? "sky"
        : "default"
    : undefined;

  const checklistProgress = task.checklist
    ? `${task.checklist.filter((c) => c.completed).length}/${task.checklist.length}`
    : undefined;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(task)}
      className={cn(
        "group flex items-start gap-3 px-4 py-2.5 rounded-[12px] transition-all duration-200 cursor-pointer select-none",
        completing && "opacity-50 scale-[0.98]",
        task.completed
          ? "opacity-40"
          : "hover:bg-bone/50 active:scale-[0.995]"
      )}
    >
      {/* Drag handle (visible on hover) */}
      <div
        className={cn(
          "pt-0.5 -ml-2 transition-opacity duration-150",
          hovered && !task.completed ? "opacity-30" : "opacity-0"
        )}
      >
        <GripVertical size={14} className="text-clay" />
      </div>

      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={cn(
          "relative w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200",
          task.completed || completing
            ? "border-sage bg-sage scale-100"
            : "border-clay-light hover:border-ember hover:scale-110"
        )}
      >
        {(task.completed || completing) && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-white"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={completing ? "animate-[checkDraw_0.3s_ease-out_forwards]" : ""}
              style={
                completing
                  ? { strokeDasharray: 24, strokeDashoffset: 24 }
                  : undefined
              }
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm leading-snug truncate",
              task.completed || completing
                ? "line-through text-ink-muted"
                : "text-ink"
            )}
          >
            {task.name}
          </span>
        </div>

        {/* Metadata row */}
        {!compact && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.dueDate && dateBadgeVariant && (
              <Badge variant={dateBadgeVariant} className="text-[10px] py-0 px-1.5">
                <CalendarDays size={10} className="mr-1" />
                {formatDate(task.dueDate)}
              </Badge>
            )}
            {task.reminderType && task.reminderType !== "none" && (
              <Bell size={12} className="text-amber" />
            )}
            {checklistProgress && (
              <span className="text-[10px] text-clay">{checklistProgress}</span>
            )}
            {showProject && (
              <Badge variant="ember" className="text-[10px] py-0 px-1.5">
                Personal
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div
        className={cn(
          "flex items-center gap-0.5 transition-opacity duration-150",
          hovered && !task.completed ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
