import { useState, useRef, useEffect } from "react";
import type { DemoTask } from "./use-demo-tasks";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { motion, useAnimate } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { playTaskCompleteSound } from "@/lib/sounds";

interface DemoTaskItemProps {
  task: DemoTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  compact?: boolean;
  insertPosition?: "before" | "after" | null;
  isOverlay?: boolean;
}

export function DemoTaskItem({
  task,
  onToggle,
  onDelete,
  onUpdateTitle,
  compact = false,
  insertPosition = null,
  isOverlay = false,
}: DemoTaskItemProps) {
  const [completing, setCompleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [checkboxScope, animateCheckbox] = useAnimate();
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: editing || isOverlay,
  });

  // Focus input when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Notion-style: items stay in place, only the DragOverlay moves
  const style = {
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === "completed" || completing) return;
    setCompleting(true);
    playTaskCompleteSound();

    // Framer Motion celebration animation
    if (!reducedMotion) {
      animateCheckbox(checkboxScope.current, { scale: 1.3 }, { duration: 0.15, ease: [0.16, 1, 0.3, 1] })
        .then(() => animateCheckbox(checkboxScope.current, { scale: 1 }, { duration: 0.3, type: "spring", stiffness: 400, damping: 15 }));
    }

    setTimeout(() => {
      onToggle(task.id);
      setCompleting(false);
    }, 400);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === "completed") return;
    setEditing(true);
    setEditValue(task.title);
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    } else {
      setEditValue(task.title);
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    } else if (e.key === "Escape") {
      setEditValue(task.title);
      setEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group flex items-center gap-2 rounded-[10px] transition-colors duration-200 select-none relative cursor-grab active:cursor-grabbing",
        compact ? "px-2 py-1.5" : "px-3 py-2",
        completing && "opacity-50",
        task.status === "completed"
          ? "opacity-40"
          : "hover:bg-bone/50",
        insertPosition === "before" &&
          "before:absolute before:top-0 before:left-2 before:right-2 before:h-0.5 before:-translate-y-1/2 before:bg-ember/50 before:rounded-full before:shadow-[0_0_6px_rgba(212,100,74,0.4)] before:animate-pulse",
        insertPosition === "after" &&
          "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:translate-y-1/2 after:bg-ember/50 after:rounded-full after:shadow-[0_0_6px_rgba(212,100,74,0.4)] after:animate-pulse"
      )}
    >
      {/* Drag handle (visual indicator) */}
      <div
        className={cn(
          "transition-opacity duration-150 flex-shrink-0",
          hovered && task.status !== "completed" && !editing
            ? "opacity-30"
            : "opacity-0"
        )}
      >
        <GripVertical size={compact ? 12 : 14} className="text-clay" />
      </div>

      {/* Checkbox */}
      <button
        ref={checkboxScope}
        onClick={handleCheck}
        className={cn(
          "relative rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-[border-color,background-color] duration-200",
          compact ? "w-4 h-4" : "w-5 h-5",
          task.status === "completed" || completing
            ? "border-sage bg-sage"
            : "border-clay-light hover:border-ember hover:scale-110"
        )}
      >
        {(task.status === "completed" || completing) && (
          <Check
            size={compact ? 10 : 12}
            className="text-white"
            strokeWidth={3}
          />
        )}
      </button>

      {/* Title */}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleEditKeyDown}
          className={cn(
            "flex-1 bg-transparent border-none outline-none text-ink",
            compact ? "text-xs" : "text-sm"
          )}
        />
      ) : (
        <span
          className={cn(
            "flex-1 truncate",
            compact ? "text-xs" : "text-sm",
            task.status === "completed" || completing
              ? "line-through text-ink-muted"
              : "text-ink"
          )}
        >
          {task.title}
        </span>
      )}

      {/* Delete button */}
      {!editing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-clay hover:text-red-500 hover:bg-red-50 transition-all duration-150",
            hovered && task.status !== "completed" ? "opacity-100" : "opacity-0"
          )}
        >
          <Trash2 size={compact ? 12 : 14} />
        </button>
      )}
    </div>
  );
}

// Compact version for weekly view
export function DemoWeeklyTaskItem({
  task,
  onClick,
}: {
  task: DemoTask;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useSortable({ id: `week-task-${task.id}` });

  const style = {
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      data-task-id={task.id}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded-[6px] text-[11px] text-ink-light truncate transition-colors",
        "hover:bg-bone/60",
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-clay-light flex-shrink-0" />
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
}
