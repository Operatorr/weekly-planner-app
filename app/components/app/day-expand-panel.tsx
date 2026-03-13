import { useEffect, useRef } from "react";
import type { Task } from "@/lib/types";
import { TaskList } from "@/components/app/task-list";
import { X } from "lucide-react";

interface DayExpandPanelProps {
  day: { label: string; date: string };
  tasks: Task[];
  onClose: () => void;
}

export function DayExpandPanel({ day, tasks, onClose }: DayExpandPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Don't close if a TaskDetail dialog is open on top
        const taskDetailOpen = document.querySelector('[aria-label="Task details"]');
        if (taskDetailOpen) return;
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const allTasks = [...activeTasks, ...completedTasks];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-overlay z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Day tasks"
        className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-surface-raised border-l border-border-subtle z-50 flex flex-col animate-slide-right shadow-xl overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <span className="text-xs text-clay font-medium tracking-wider uppercase">
            {day.label}
          </span>
          <div className="flex items-center gap-2">
            <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
              Esc
            </kbd>
            <button
              onClick={onClose}
              aria-label="Close day panel"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <TaskList
            tasks={allTasks}
            title="Tasks"
            count={activeTasks.length}
            alwaysShowCompleted={true}
            emptyMessage="No tasks for this day"
          />
        </div>
      </div>
    </>
  );
}
