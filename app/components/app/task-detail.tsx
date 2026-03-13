import { useState, useEffect, useRef, useCallback } from "react";
import type { Task } from "@/lib/types";
import { useTaskContext } from "@/lib/task-context";
import { DatePicker } from "@/components/app/date-picker";
import { ReminderSelector, type ReminderValue } from "@/components/app/reminder-selector";
import { ProjectSelector } from "@/components/app/project-selector";
import { useProjects } from "@/hooks/use-projects";
import { useUserTier } from "@/hooks/use-user-tier";
import { useSettings } from "@/lib/settings-context";
import { playTaskCompleteSound } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import * as api from "@/lib/api";
import {
  X,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  GripVertical,
} from "lucide-react";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  const {
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useTaskContext();
  const { data: projects = [] } = useProjects();
  const { data: userTier = "free" } = useUserTier();
  const { settings } = useSettings();
  const { getToken } = useAuth();

  const { data: checklist = [] } = useQuery({
    queryKey: ["checklist", task.id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return api.fetchChecklist(token, task.id);
    },
  });

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<string | null>(task.due_date ? task.due_date.split("T")[0] : null);
  const [isSomeday, setIsSomeday] = useState(task.is_someday || false);
  const [projectId, setProjectId] = useState(task.project_id);
  const [reminder, setReminder] = useState<ReminderValue>({ type: "none" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checklistInputRef = useRef<HTMLInputElement>(null);

  const completedCount = checklist.filter((c) => c.is_completed).length;

  // Auto-save with debounce (500ms)
  const autoSave = useCallback(
    (updates: Partial<Task>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateTask(task.id, updates);
      }, 500);
    },
    [task.id, updateTask]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    autoSave({ title: newTitle });
  };

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    autoSave({ description: newDesc });
  };

  const handleDateChange = (date: string | null) => {
    setDueDate(date);
    updateTask(task.id, { due_date: date });
  };

  const handleSomedayChange = (someday: boolean) => {
    setIsSomeday(someday);
    updateTask(task.id, { is_someday: someday });
  };

  const handleProjectChange = (pid: string | null) => {
    setProjectId(pid || "");
    updateTask(task.id, { project_id: pid || undefined });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    addChecklistItem(task.id, newChecklistItem.trim());
    setNewChecklistItem("");
    checklistInputRef.current?.focus();
  };

  // Focus trap and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (settings.soundOnComplete) {
          playTaskCompleteSound();
        }
        if (task.status === "completed") {
          uncompleteTask(task.id);
        } else {
          completeTask(task.id);
        }
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, task.id, task.status, completeTask, uncompleteTask, settings.soundOnComplete]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
          <div className="flex items-center gap-2">
            <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
              Esc
            </kbd>
            <button
              onClick={onClose}
              aria-label="Close task details"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task name */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            aria-label="Task name"
            name="task-name"
            autoComplete="off"
            className="w-full px-2 py-1.5 text-xl font-semibold text-ink bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md placeholder:text-clay"
            placeholder="Task name"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add a description…"
            aria-label="Task description"
            name="task-description"
            rows={4}
            className="w-full px-2 py-1.5 text-sm text-ink-light bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md resize-none leading-relaxed placeholder:text-clay"
          />

          {/* Meta fields */}
          <div className="space-y-2">
            <DatePicker value={dueDate} onChange={handleDateChange} isSomeday={isSomeday} onSomedayChange={handleSomedayChange} />
            <ReminderSelector value={reminder} onChange={setReminder} userTier={userTier} />
            <ProjectSelector value={projectId} onChange={handleProjectChange} projects={projects} />
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
              <button
                onClick={() => {
                  setShowChecklistInput(true);
                  setTimeout(() => checklistInputRef.current?.focus(), 50);
                }}
                className="text-xs text-ember hover:text-ember-dark transition-colors flex items-center gap-1"
              >
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
                    onClick={() => {
                      if (!item.is_completed && settings.soundOnComplete) {
                        playTaskCompleteSound();
                      }
                      toggleChecklistItem(task.id, item.id);
                    }}
                    className={cn(
                      "w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                      item.is_completed
                        ? "border-sage bg-sage"
                        : "border-clay-light hover:border-ember"
                    )}
                  >
                    {item.is_completed && (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-sm flex-1",
                      item.is_completed
                        ? "line-through text-ink-muted"
                        : "text-ink-light"
                    )}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => deleteChecklistItem(task.id, item.id)}
                    className="w-5 h-5 rounded flex items-center justify-center text-clay opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-500 transition-all"
                    aria-label="Delete checklist item"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist input */}
            {showChecklistInput && (
              <div className="flex items-center gap-2.5 px-2 py-1.5 mt-1">
                <div className="w-3" />
                <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-clay-light/50 flex-shrink-0" />
                <input
                  ref={checklistInputRef}
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddChecklistItem();
                    }
                    if (e.key === "Escape") {
                      setShowChecklistInput(false);
                      setNewChecklistItem("");
                    }
                  }}
                  placeholder="Add an item..."
                  className="flex-1 text-sm text-ink-light bg-transparent outline-none placeholder:text-clay pl-2"
                />
                <button
                  onClick={handleAddChecklistItem}
                  disabled={!newChecklistItem.trim()}
                  className="text-xs text-ember hover:text-ember-dark disabled:opacity-40 transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {checklist.length === 0 && !showChecklistInput && (
              <p className="text-sm text-clay italic">
                No checklist items yet
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Delete this task?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleDelete}
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
              <>
                {task.status === "completed" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      if (settings.soundOnComplete) {
                        playTaskCompleteSound();
                      }
                      uncompleteTask(task.id);
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Uncomplete
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      if (settings.soundOnComplete) {
                        playTaskCompleteSound();
                      }
                      completeTask(task.id);
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Complete
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </>
            )}
          </div>

          <span className="text-xs text-clay">
            Created{" "}
            {task.created_at
              ? new Date(task.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "recently"}
          </span>
        </div>
      </div>
    </>
  );
}
