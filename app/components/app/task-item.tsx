import { useState, useRef, useEffect } from "react";
import type { Task, Project } from "@/lib/types";
import { formatDate, isToday, isPast } from "@/lib/task-context";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import * as api from "@/lib/api";
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
  Archive,
  Sun,
  ListChecks,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { gsap } from "@/lib/gsap-config";
import { easings } from "@/lib/animation-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createCompletionParticles } from "@/hooks/use-drag-animation";
import { useSettings } from "@/lib/settings-context";
import { playTaskCompleteSound } from "@/lib/sounds";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onClick?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  showProject?: boolean;
  project?: Project;
  compact?: boolean;
  sortable?: boolean;
  insertPosition?: "before" | "after" | null;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onClick,
  onDelete,
  onUpdate,
  showProject,
  project,
  compact,
  sortable = false,
  insertPosition,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: TaskItemProps) {
  const { settings } = useSettings();
  const { getToken } = useAuth();

  const { data: checklistItems = [] } = useQuery({
    queryKey: ["checklist", task.id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.fetchChecklist(token, task.id);
    },
    staleTime: 2 * 60 * 1000, // 2 min — avoid refetching on every render
  });

  const checklistCount =
    checklistItems.length > 0
      ? { done: checklistItems.filter((c) => c.is_completed).length, total: checklistItems.length }
      : undefined;
  const [completing, setCompleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !sortable,
  });

  // GSAP drag feedback is now handled by DragOverlay in the parent
  // The original element is hidden during drag to avoid duplication

  // Notion-style: items stay static during drag, only insertion indicator moves
  // Don't apply transform/transition - items won't shift around
  const style = sortable
    ? {
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === "completed") {
      if (settings.soundOnComplete) {
        playTaskCompleteSound();
      }
      onToggle?.(task.id);
      return;
    }
    setCompleting(true);

    if (settings.soundOnComplete) {
      playTaskCompleteSound();
    }

    // GSAP celebration animation
    if (!reducedMotion && checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();

      // Pulse animation on checkbox
      gsap.to(checkboxRef.current, {
        scale: 1.3,
        duration: 0.15,
        ease: easings.outExpo,
        onComplete: () => {
          gsap.to(checkboxRef.current, {
            scale: 1,
            duration: 0.3,
            ease: easings.spring,
          });
        },
      });

      // Create celebration particles
      createCompletionParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    setTimeout(() => {
      onToggle?.(task.id);
      setCompleting(false);
    }, 600);
  };

  const dateBadgeVariant = task.due_date
    ? isPast(task.due_date) && !isToday(task.due_date)
      ? (settings.highlightOverdueTasks ? "destructive" : "default")
      : isToday(task.due_date)
        ? "sky"
        : "default"
    : undefined;

  const checklistProgress = checklistCount
    ? `${checklistCount.done}/${checklistCount.total}`
    : undefined;

  // Combine refs for both dnd-kit and our GSAP animations
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={setRefs}
      data-task-id={task.id}
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
        "task-item group flex items-center gap-3 px-4 py-2.5 rounded-[12px] cursor-pointer select-none w-full text-left relative",
        !isDragging && "transition-colors duration-200",
        completing && "opacity-50",
        isDragging && "bg-surface-raised",
        task.status === "completed"
          ? "opacity-40"
          : "hover:bg-bone/50",
        // Insertion indicator via pseudo-elements (no DOM changes during drag)
        // Subtle glowing ember line with pulse
        insertPosition === "before" &&
          "before:absolute before:top-0 before:left-3 before:right-3 before:h-0.5 before:-translate-y-1/2 before:bg-ember/50 before:rounded-full before:shadow-[0_0_6px_rgba(212,100,74,0.4)] before:animate-pulse",
        insertPosition === "after" &&
          "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:translate-y-1/2 after:bg-ember/50 after:rounded-full after:shadow-[0_0_6px_rgba(212,100,74,0.4)] after:animate-pulse"
      )}
    >
      {/* Drag handle (visible on hover) */}
      {sortable && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "hidden md:flex self-center -ml-2 transition-opacity duration-150 cursor-grab active:cursor-grabbing",
            task.status !== "completed"
              ? "md:opacity-0 md:group-hover:opacity-50"
              : "opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} className="text-clay" />
        </div>
      )}

      {/* Checkbox */}
      <button
        ref={checkboxRef}
        onClick={handleCheck}
        className={cn(
          "task-checkbox relative w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 self-center transition-[border-color,background-color] duration-200",
          task.status === "completed" || completing
            ? "border-sage bg-sage"
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
        {!compact && (task.is_someday || (task.due_date && dateBadgeVariant) || checklistProgress || (showProject && project) || task.description) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.is_someday && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-clay/10 text-clay">
                <Archive size={10} className="mr-1" />
                Someday
              </Badge>
            )}
            {task.due_date && dateBadgeVariant && (
              <Badge variant={dateBadgeVariant} className="text-[10px] py-0 px-1.5">
                <CalendarDays size={10} className="mr-1" />
                {formatDate(task.due_date, settings.dateFormat)}
              </Badge>
            )}
            {checklistProgress && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-clay/10 text-clay">
                <ListChecks size={10} className="mr-1" />
                {checklistProgress}
              </Badge>
            )}
            {showProject && project && (
              <span className="flex items-center gap-1 text-[10px] text-ink-muted">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </span>
            )}
            {task.description && (
              task.description.length > 40 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDescExpanded((v) => !v);
                  }}
                  className="flex items-center gap-1 text-[10px] text-clay hover:text-ink-muted transition-colors cursor-pointer"
                >
                  <span className="max-w-[140px] truncate">
                    {task.description.slice(0, 40) + "…"}
                  </span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={cn(
                      "transition-transform duration-200 flex-shrink-0",
                      descExpanded && "rotate-180"
                    )}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : (
                <span className="text-[10px] text-clay max-w-[140px] truncate">
                  {task.description}
                </span>
              )
            )}
          </div>
        )}

        {/* Expandable description */}
        <AnimatePresence initial={false}>
          {descExpanded && task.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <p className="text-[11px] leading-relaxed text-clay mt-1.5 whitespace-pre-line break-words">
                {task.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context menu / Actions */}
      <div
        className={cn(
          "flex items-center gap-0.5 transition-opacity duration-150",
          task.status !== "completed"
            ? "opacity-100 md:opacity-0 md:group-hover:opacity-100"
            : "opacity-0"
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
          <DropdownMenuContent align="end" className="w-48 bg-white">
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
                if (settings.soundOnComplete) {
                  playTaskCompleteSound();
                }
                onToggle?.(task.id);
              }}
            >
              <Check size={14} className="text-clay" />
              <span>{task.status === "completed" ? "Uncomplete" : "Complete"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp?.();
              }}
            >
              <MoveUp size={14} className="text-clay" />
              <span>Move Up</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLast}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown?.();
              }}
            >
              <MoveDown size={14} className="text-clay" />
              <span>Move Down</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Schedule options */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                const today = new Date().toISOString().split("T")[0];
                onUpdate?.(task.id, { due_date: today, is_someday: false });
              }}
            >
              <Sun size={14} className="text-clay" />
              <span>Schedule for Today</span>
            </DropdownMenuItem>
            {task.is_someday ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate?.(task.id, { due_date: null, is_someday: false });
                }}
              >
                <Sun size={14} className="text-clay" />
                <span>Move to Today</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate?.(task.id, { due_date: null, is_someday: true });
                }}
              >
                <Archive size={14} className="text-clay" />
                <span>Move to Someday</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (settings.confirmBeforeDelete) {
                  if (!window.confirm("Delete this task?")) return;
                }
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
