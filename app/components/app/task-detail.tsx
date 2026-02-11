import { useState, useEffect, useRef, useCallback } from "react";
import type { Task } from "@/lib/mock-data";
import { formatDateLong } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  X,
  CalendarDays,
  Bell,
  FolderOpen,
  Trash2,
  Plus,
  Check,
  GripVertical,
} from "lucide-react";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Focus trap and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    // Focus first focusable element
    const firstFocusable = sheetRef.current?.querySelector<HTMLElement>(
      'button, [href], input, textarea'
    );
    firstFocusable?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((c) => c.completed).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-overlay z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-label="Task details"
        className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-surface-raised border-l border-border-subtle z-50 flex flex-col animate-slide-right shadow-xl overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <span className="text-xs text-clay font-medium tracking-wider uppercase">
            Task Details
          </span>
          <button
            onClick={onClose}
            aria-label="Close task details"
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Task name"
            name="task-name"
            autoComplete="off"
            className="w-full text-xl font-semibold text-ink bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md placeholder:text-clay"
            placeholder="Task name"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description\u2026"
            aria-label="Task description"
            name="task-description"
            rows={4}
            className="w-full text-sm text-ink-light bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md resize-none leading-relaxed placeholder:text-clay"
          />

          {/* Meta fields */}
          <div className="space-y-2">
            <MetaField
              icon={<CalendarDays size={15} />}
              label="Date"
              value={task.dueDate ? formatDateLong(task.dueDate) : "No date"}
            />
            <MetaField
              icon={<Bell size={15} />}
              label="Reminder"
              value={
                task.reminderType === "email"
                  ? `Email at ${task.reminderTime || "9:00 AM"}`
                  : "None"
              }
            />
            <MetaField
              icon={<FolderOpen size={15} />}
              label="Project"
              value="Personal"
              valueColor="#D4644A"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">Checklist</span>
                {checklist.length > 0 && (
                  <span className="text-xs text-clay">
                    {completedCount}/{checklist.length}
                  </span>
                )}
              </div>
              <button className="text-xs text-ember hover:text-ember-dark transition-colors flex items-center gap-1">
                <Plus size={12} />
                Add item
              </button>
            </div>

            {/* Progress bar */}
            {checklist.length > 0 && (
              <div className="h-1.5 bg-bone rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-[width] duration-300"
                  style={{
                    width: `${(completedCount / checklist.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Items */}
            <div className="space-y-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-[8px] hover:bg-bone/50 transition-colors group"
                >
                  <GripVertical
                    size={12}
                    className="text-clay opacity-0 group-hover:opacity-30 transition-opacity"
                  />
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={cn(
                      "w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                      item.completed
                        ? "border-sage bg-sage"
                        : "border-clay-light hover:border-ember"
                    )}
                  >
                    {item.completed && (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-sm",
                      item.completed
                        ? "line-through text-ink-muted"
                        : "text-ink-light"
                    )}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {checklist.length === 0 && (
              <p className="text-sm text-clay italic">
                No checklist items yet
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Delete this task?</span>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  // TODO: wire up actual delete
                  onClose();
                }}
              >
                Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          )}

          <span className="text-xs text-clay">
            Created {task.createdAt ? new Date(task.createdAt + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "recently"}
          </span>
        </div>
      </div>
    </>
  );
}

function MetaField({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-bone/40 hover:bg-bone/60 transition-colors">
      <span className="text-clay">{icon}</span>
      <span className="text-xs text-clay w-16">{label}</span>
      <span
        className="text-sm text-ink-light"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
