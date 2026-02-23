import { useState } from "react";
import type { Task } from "@/lib/types";
import { formatDate, isToday, isPast } from "@/lib/task-context";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Check,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onClick?: (task: Task) => void;
  onDelete?: (id: string) => void;
  showProject?: boolean;
  compact?: boolean;
  checklistCount?: { done: number; total: number };
  sortable?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onClick,
  onDelete,
  showProject,
  compact,
  checklistCount,
  sortable = false,
}: TaskItemProps) {
  const [completing, setCompleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !sortable,
  });

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === "completed") return;
    setCompleting(true);
    setTimeout(() => {
      onToggle?.(task.id);
      setCompleting(false);
    }, 600);
  };

  const dateBadgeVariant = task.due_date
    ? isPast(task.due_date) && !isToday(task.due_date)
      ? "destructive"
      : isToday(task.due_date)
        ? "sky"
        : "default"
    : undefined;

  const checklistProgress = checklistCount
    ? `${checklistCount.done}/${checklistCount.total}`
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(task);
        }
      }}
      className={cn(
        "group flex items-start gap-3 px-4 py-2.5 rounded-[12px] transition-colors duration-200 cursor-pointer select-none w-full text-left",
        completing && "opacity-50 scale-[0.98]",
        isDragging && "shadow-lg bg-surface-raised",
        task.status === "completed"
          ? "opacity-40"
          : "hover:bg-bone/50 active:scale-[0.995]"
      )}
    >
      {/* Drag handle (visible on hover) */}
      {sortable && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "pt-0.5 -ml-2 transition-opacity duration-150 cursor-grab active:cursor-grabbing",
            hovered && task.status !== "completed" ? "opacity-30" : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} className="text-clay" />
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={cn(
          "relative w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-[border-color,background-color,transform] duration-200",
          task.status === "completed" || completing
            ? "border-sage bg-sage scale-100"
            : "border-clay-light hover:border-ember hover:scale-110"
        )}
      >
        {(task.status === "completed" || completing) && (
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
              task.status === "completed" || completing
                ? "line-through text-ink-muted"
                : "text-ink"
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Metadata row */}
        {!compact && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.due_date && dateBadgeVariant && (
              <Badge variant={dateBadgeVariant} className="text-[10px] py-0 px-1.5">
                <CalendarDays size={10} className="mr-1" />
                {formatDate(task.due_date)}
              </Badge>
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

      {/* Context menu / Actions */}
      <div
        className={cn(
          "flex items-center gap-0.5 transition-opacity duration-150",
          hovered && task.status !== "completed" ? "opacity-100" : "opacity-0"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Task options"
              className="w-6 h-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(task);
              }}
            >
              <Pencil size={14} className="text-clay" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(task.id);
              }}
            >
              <Check size={14} className="text-clay" />
              <span>{task.status === "completed" ? "Uncomplete" : "Complete"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id);
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
