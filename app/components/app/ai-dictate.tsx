import { useState, useEffect } from "react";
import { X, Pencil, MicOff, Mic, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type DictateState = "recording" | "processing" | "results";

interface MockTask {
  id: number;
  title: string;
  description: string;
  checklist?: string[];
  due_date?: string; // inferred from dictation
  due_label?: string; // human-readable label shown in UI
}

const MOCK_TASKS: MockTask[] = [
  {
    id: 1,
    title: "Review Q1 budget spreadsheet",
    description: "Go through the quarterly budget with the finance team and flag any discrepancies before the board meeting.",
    checklist: ["Download latest version from Drive", "Compare against last quarter", "Highlight overruns > 10%"],
    due_date: "2026-03-13",
    due_label: "Tomorrow",
  },
  {
    id: 2,
    title: "Send project update to stakeholders",
    description: "Draft a concise email summarising the current sprint progress and upcoming milestones.",
    due_date: "2026-03-13",
    due_label: "Tomorrow",
  },
  {
    id: 3,
    title: "Schedule team retrospective",
    description: "Find a time slot that works for everyone and book a conference room or video call link.",
    checklist: ["Check calendar availability", "Send calendar invite", "Prepare discussion prompts"],
    due_date: "2026-03-16",
    due_label: "Next Monday",
  },
];

interface AiDictateProps {
  onClose: () => void;
}

export function AiDictate({ onClose }: AiDictateProps) {
  const [state, setState] = useState<DictateState>("recording");

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
      {state === "recording" && <RecordingState onClose={onClose} onDone={() => setState("processing")} />}
      {state === "processing" && <ProcessingState onDone={() => setState("results")} />}
      {state === "results" && <ResultsState onClose={onClose} />}
    </div>
  );
}

/* ── State 2: Recording ─────────────────────────────────────── */

function RecordingState({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [isRecording, setIsRecording] = useState(true);

  // Space to toggle pause/resume
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        setIsRecording((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Voice to Tasks
        </span>
        <button
          onClick={onClose}
          className="h-6 w-6 rounded-full flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Recording area */}
      <div className="px-4 py-6 flex flex-col items-center gap-4">
        {/* Waveform */}
        <div className="flex items-center gap-1 h-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-colors duration-300 ${isRecording ? "bg-ember ai-wave-bar" : "bg-clay-light"}`}
              style={isRecording ? { animationDelay: `${(i - 1) * 0.12}s`, height: "2rem" } : { height: "0.375rem" }}
            />
          ))}
        </div>

        {/* Status */}
        <p className="text-sm italic text-clay">
          {isRecording ? <>Listening&hellip;</> : "Paused"}
        </p>

        {/* Transcription preview */}
        <p className="text-sm text-ink text-center w-full leading-relaxed">
          &ldquo;Review the Q1 budget with finance, send an update email to stakeholders, and schedule a team retro for next week&hellip;&rdquo;
        </p>

        {/* Start over — only shown when paused */}
        {!isRecording && (
          <button
            onClick={() => setIsRecording(true)}
            className="text-xs text-clay hover:text-ink-muted transition-colors underline underline-offset-2"
          >
            Start over
          </button>
        )}
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

        {/* Mic toggle button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setIsRecording((v) => !v)}
            className={`relative h-12 w-12 rounded-full flex items-center justify-center text-white shadow-md transition-colors ${
              isRecording ? "bg-ember hover:bg-ember-dark" : "bg-clay hover:bg-ink-muted"
            }`}
            aria-label={isRecording ? "Pause recording" : "Resume recording"}
          >
            {isRecording && <span className="absolute inset-0 rounded-full bg-ember ai-pulse-ring" />}
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">Space</kbd>
        </div>

        <button
          onClick={onDone}
          disabled={isRecording}
          className={`text-xs border rounded-[8px] px-3 py-1.5 transition-colors ${
            isRecording
              ? "text-clay border-border opacity-50 cursor-not-allowed"
              : "text-ink border-border hover:bg-bone"
          }`}
        >
          Done
        </button>
      </div>
    </>
  );
}

/* ── State 3: Processing ────────────────────────────────────── */

function ProcessingState({ onDone }: { onDone: () => void }) {
  // Auto-advance after a short delay for mockup feel
  // In a real impl this would be driven by the AI response
  return (
    <>
      <div className="px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          Voice to Tasks
        </span>
      </div>

      <div className="px-4 py-10 flex flex-col items-center gap-4">
        {/* Animated sparkle */}
        <div className="ai-sparkle-spin text-ember">
          <AiStarsIcon size={32} />
        </div>

        <p className="text-sm font-medium text-ink">Analysing your dictation&hellip;</p>
        <p className="text-xs text-clay">Turning your words into tasks…</p>

        {/* Progress bar */}
        <div className="w-48 h-1.5 rounded-full bg-bone-dark overflow-hidden mt-2">
          <div className="h-full rounded-full bg-ember ai-progress-bar" />
        </div>
      </div>

      {/* Dev helper: click to advance */}
      <div className="px-4 pb-4 flex justify-center">
        <button
          onClick={onDone}
          className="text-[10px] text-clay hover:text-ink transition-colors border border-border rounded px-2 py-1"
        >
          [mockup] advance →
        </button>
      </div>
    </>
  );
}

/* ── State 4: Results ───────────────────────────────────────── */

function ResultsState({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          {MOCK_TASKS.length} tasks from your dictation
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
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="relative bg-surface-raised rounded-[10px] border border-border p-3 pr-8">
            {/* Edit button */}
            <button
              className="absolute top-2.5 right-2.5 h-6 w-6 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
              aria-label="Edit task"
            >
              <Pencil size={12} />
            </button>

            <p className="font-medium text-sm text-ink leading-snug">{task.title}</p>

            {task.due_label && (
              <div className="flex items-center gap-1 mt-1.5">
                <Calendar size={11} className="text-clay shrink-0" />
                <span className="text-[11px] text-clay">{task.due_label}</span>
              </div>
            )}

            {task.description && (
              <p className="text-xs text-ink-light mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
            )}

            {task.checklist && task.checklist.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {task.checklist.map((item, idx) => (
                  <li key={idx} className="text-[11px] text-clay flex items-start gap-1.5">
                    <span className="mt-px shrink-0">□</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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
        <Button variant="primary" size="sm" className="h-7 px-3 text-xs">
          Add All {MOCK_TASKS.length} Tasks
        </Button>
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
      {/* Large star top-right */}
      <path d="M11 1 L11.6 3.4 L14 4 L11.6 4.6 L11 7 L10.4 4.6 L8 4 L10.4 3.4 Z" />
      {/* Large star bottom-left */}
      <path d="M4.5 8 L5 10 L7 10.5 L5 11 L4.5 13 L4 11 L2 10.5 L4 10 Z" />
      {/* Small star top-left */}
      <path d="M3 1.5 L3.35 2.65 L4.5 3 L3.35 3.35 L3 4.5 L2.65 3.35 L1.5 3 L2.65 2.65 Z" />
      {/* Small star bottom-right */}
      <path d="M13 10.5 L13.25 11.25 L14 11.5 L13.25 11.75 L13 12.5 L12.75 11.75 L12 11.5 L12.75 11.25 Z" />
    </svg>
  );
}
