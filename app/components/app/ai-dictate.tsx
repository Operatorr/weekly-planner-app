import { useState, useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTaskContext, formatDate } from "@/lib/task-context";
import * as api from "@/lib/api";
import type { DictatedTask } from "@/lib/types";

type DictateState = "dictation" | "processing" | "results";

interface AiDictateProps {
  onClose: () => void;
}

export function AiDictate({ onClose }: AiDictateProps) {
  const [state, setState] = useState<DictateState>("dictation");
  const [dictation, setDictation] = useState("");
  const [tasks, setTasks] = useState<DictatedTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="rounded-[14px] border border-border bg-surface-raised shadow-md overflow-hidden animate-scale-in">
      {state === "dictation" && (
        <DictationState
          dictation={dictation}
          onDictationChange={setDictation}
          onClose={onClose}
          onDone={() => setState("processing")}
        />
      )}
      {state === "processing" && (
        <ProcessingState
          dictation={dictation}
          error={error}
          onResult={(result) => {
            setTasks(result);
            setError(null);
            setState("results");
          }}
          onError={(msg) => {
            setError(msg);
            setState("dictation");
          }}
        />
      )}
      {state === "results" && (
        <ResultsState
          tasks={tasks}
          onRemoveTask={(idx) => setTasks((t) => t.filter((_, i) => i !== idx))}
          onClose={onClose}
        />
      )}
    </div>
  );
}

/* ── State 1: Dictation (textarea) ─────────────────────────── */

function DictationState({
  dictation,
  onDictationChange,
  onClose,
  onDone,
}: {
  dictation: string;
  onDictationChange: (v: string) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = dictation.trim().length > 0;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
      e.preventDefault();
      onDone();
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Dictate to Tasks
        </span>
        <button
          onClick={onClose}
          className="h-6 w-6 rounded-full flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Textarea */}
      <div className="px-4 py-4">
        <textarea
          ref={textareaRef}
          value={dictation}
          onChange={(e) => onDictationChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or dictate your tasks here... e.g. 'Review the Q1 budget with finance, send an update email to stakeholders, and schedule a team retro for next week'"
          className="w-full h-28 resize-none rounded-[8px] border border-border bg-bone/30 px-3 py-2.5 text-sm text-ink placeholder:text-clay leading-relaxed focus:outline-none focus:ring-1 focus:ring-ember/40 focus:border-ember/40"
          maxLength={10000}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-clay">
            Use any dictation tool (Wispr, macOS Dictation, etc.) or just type
          </p>
          <span className="text-[10px] text-clay tabular-nums">{dictation.length.toLocaleString()}/10,000</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-bone/30">
        <div className="flex items-center gap-2">
          <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">Esc</kbd>
          <button
            onClick={onClose}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-2">
          <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
            {navigator.platform.includes("Mac") ? "\u2318" : "Ctrl"} + {"\u21B5"}
          </kbd>
          <Button
            variant="primary"
            size="sm"
            className="h-7 px-3 text-xs"
            disabled={!canSubmit}
            onClick={onDone}
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}

/* ── State 2: Processing ───────────────────────────────────── */

function ProcessingState({
  dictation,
  error: previousError,
  onResult,
  onError,
}: {
  dictation: string;
  error: string | null;
  onResult: (tasks: DictatedTask[]) => void;
  onError: (msg: string) => void;
}) {
  const { getToken } = useAuth();
  const didRun = useRef(false);

  useEffect(() => {
    // Prevent StrictMode double-fire
    if (didRun.current) return;
    didRun.current = true;

    async function process() {
      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const { tasks } = await api.processDictation(token, dictation);
        if (tasks.length === 0) {
          onError("No tasks could be extracted from your dictation. Try being more specific.");
        } else {
          onResult(tasks);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        onError(msg);
      }
    }

    process();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Dictate to Tasks
        </span>
      </div>

      <div className="px-4 py-10 flex flex-col items-center gap-4">
        <div className="ai-sparkle-spin text-ember">
          <AiStarsIcon size={32} />
        </div>

        <p className="text-sm font-medium text-ink">Analysing your dictation&hellip;</p>
        <p className="text-xs text-clay">Turning your words into tasks&hellip;</p>

        <div className="w-48 h-1.5 rounded-full bg-bone-dark overflow-hidden mt-2">
          <div className="h-full rounded-full bg-ember ai-progress-bar" />
        </div>
      </div>
    </>
  );
}

/* ── State 3: Results ──────────────────────────────────────── */

function ResultsState({
  tasks,
  onRemoveTask,
  onClose,
}: {
  tasks: DictatedTask[];
  onRemoveTask: (idx: number) => void;
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const { createTask, addChecklistItem } = useTaskContext();
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && tasks.length > 0) {
        e.preventDefault();
        handleAddAll();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tasks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddAll() {
    // Create tasks sequentially to avoid optimistic update race conditions.
    // Close immediately for snappy UX — mutations settle in the background.
    const count = tasks.length;
    onClose();
    toast(`Added ${count} task${count === 1 ? "" : "s"} from dictation`);

    for (const task of tasks) {
      try {
        const created = await createTask({
          title: task.title,
          description: task.description || undefined,
          due_date: task.due_date ?? undefined,
        });
        if (task.checklist?.length && created?.id) {
          for (const item of task.checklist) {
            await addChecklistItem(created.id, item);
          }
        }
      } catch {
        // Individual task failures are handled by the mutation's error/rollback logic
      }
    }
  }

  function dueLabel(dateStr?: string | null): string | null {
    if (!dateStr) return null;
    return formatDate(dateStr);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} from your dictation
        </span>
        <button
          onClick={onClose}
          className="h-6 w-6 rounded-full flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable task list */}
      <div className="px-3 py-3 space-y-2 max-h-72 overflow-y-auto">
        {tasks.map((task, idx) => {
          const label = dueLabel(task.due_date);
          return (
            <div key={idx} className="relative bg-surface-raised rounded-[10px] border border-border p-3 pr-8">
              {/* Remove button */}
              <button
                onClick={() => onRemoveTask(idx)}
                className="absolute top-2.5 right-2.5 h-6 w-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
                aria-label="Remove task"
              >
                <X size={12} />
              </button>

              <p className="font-medium text-sm text-ink leading-snug">{task.title}</p>

              {label && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Calendar size={11} className="text-clay shrink-0" />
                  <span className="text-[11px] text-clay">{label}</span>
                </div>
              )}

              {task.description && (
                <p className="text-xs text-ink-light mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
              )}

              {task.checklist && task.checklist.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {task.checklist.map((item, i) => (
                    <li key={i} className="text-[11px] text-clay flex items-start gap-1.5">
                      <span className="mt-px shrink-0">{"\u25A1"}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-bone/30">
        <div className="flex items-center gap-2">
          <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">Esc</kbd>
          <button
            onClick={onClose}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
            {navigator.platform.includes("Mac") ? "\u2318" : "Ctrl"} + {"\u21B5"}
          </kbd>
          <Button
            variant="primary"
            size="sm"
            className="h-7 px-3 text-xs"
            disabled={tasks.length === 0}
            onClick={handleAddAll}
          >
            {`Add All ${tasks.length} Task${tasks.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ── AI Stars Icon ──────────────────────────────────────────── */

export function AiStarsIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 1 L11.6 3.4 L14 4 L11.6 4.6 L11 7 L10.4 4.6 L8 4 L10.4 3.4 Z" />
      <path d="M4.5 8 L5 10 L7 10.5 L5 11 L4.5 13 L4 11 L2 10.5 L4 10 Z" />
      <path d="M3 1.5 L3.35 2.65 L4.5 3 L3.35 3.35 L3 4.5 L2.65 3.35 L1.5 3 L2.65 2.65 Z" />
      <path d="M13 10.5 L13.25 11.25 L14 11.5 L13.25 11.75 L13 12.5 L12.75 11.75 L12 11.5 L12.75 11.25 Z" />
    </svg>
  );
}
