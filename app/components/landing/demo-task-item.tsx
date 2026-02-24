import { useState, useRef, useEffect } from "react";
import type { DemoTask } from "./use-demo-tasks";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { gsap } from "@/lib/gsap-config";
import { easings } from "@/lib/animation-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface DemoTaskItemProps {
  task: DemoTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  compact?: boolean;
}

export function DemoTaskItem({
  task,
  onToggle,
  onDelete,
  onUpdateTitle,
  compact = false,
}: DemoTaskItemProps) {
  const [completing, setCompleting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const itemRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: editing,
  });

  // GSAP drag feedback
  useEffect(() => {
    if (!itemRef.current || reducedMotion) return;

    if (isDragging) {
      gsap.to(itemRef.current, {
        scale: 1.02,
        boxShadow: "0 12px 40px rgba(44, 40, 37, 0.12)",
        rotation: 1,
        duration: 0.2,
        ease: easings.outExpo,
      });
    } else {
      gsap.to(itemRef.current, {
        scale: 1,
        boxShadow: "0 1px 2px rgba(44, 40, 37, 0.04)",
        rotation: 0,
        duration: 0.3,
        ease: easings.spring,
        clearProps: "boxShadow,rotation",
      });
    }
  }, [isDragging, reducedMotion]);

  // Focus input when editing
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === "completed" || completing) return;
    setCompleting(true);

    // GSAP celebration animation
    if (!reducedMotion && checkboxRef.current) {
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

  // Combine refs
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (itemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={setRefs}
      data-task-id={task.id}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group flex items-center gap-2 rounded-[10px] transition-colors duration-200 select-none",
        compact ? "px-2 py-1.5" : "px-3 py-2",
        completing && "opacity-50",
        isDragging && "bg-surface-raised",
        task.status === "completed"
          ? "opacity-40"
          : "hover:bg-bone/50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "transition-opacity duration-150 cursor-grab active:cursor-grabbing flex-shrink-0",
          hovered && task.status !== "completed" && !editing
            ? "opacity-30"
            : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={compact ? 12 : 14} className="text-clay" />
      </div>

      {/* Checkbox */}
      <button
        ref={checkboxRef}
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
  const itemRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // GSAP drag feedback
  useEffect(() => {
    if (!itemRef.current || reducedMotion) return;

    if (isDragging) {
      gsap.to(itemRef.current, {
        scale: 1.05,
        boxShadow: "0 8px 24px rgba(44, 40, 37, 0.15)",
        duration: 0.2,
        ease: easings.outExpo,
      });
    } else {
      gsap.to(itemRef.current, {
        scale: 1,
        boxShadow: "none",
        duration: 0.3,
        ease: easings.spring,
        clearProps: "boxShadow",
      });
    }
  }, [isDragging, reducedMotion]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  // Combine refs
  const setRefs = (node: HTMLButtonElement | null) => {
    setNodeRef(node);
    (itemRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  return (
    <button
      ref={setRefs}
      data-task-id={task.id}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-1.5 rounded-[6px] text-[11px] text-ink-light truncate transition-colors",
        "hover:bg-bone/60",
        isDragging && "bg-surface-raised"
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-clay-light flex-shrink-0" />
        <span className="truncate">{task.title}</span>
      </div>
    </button>
  );
}
