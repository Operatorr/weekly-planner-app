import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, CalendarDays, Bell, FolderOpen, X } from "lucide-react";

export function AddTask({ onAdd }: { onAdd?: (task: { name: string; description?: string }) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd?.({ name: name.trim(), description: description.trim() || undefined });
    setName("");
    setDescription("");
    // Keep expanded for rapid entry
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setExpanded(false);
      setName("");
      setDescription("");
    }
  };

  return (
    <div ref={containerRef} className="px-1">
      {!expanded ? (
        /* Collapsed state */
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border border-dashed border-clay-light/60 text-clay hover:border-ember/40 hover:text-ember/60 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-transform group-hover:scale-110">
            <Plus size={14} strokeWidth={2.5} />
          </div>
          <span className="text-sm">Add a task...</span>
          <kbd className="ml-auto hidden sm:inline text-[10px] text-clay bg-bone rounded px-1.5 py-0.5 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            N
          </kbd>
        </button>
      ) : (
        /* Expanded form */
        <div className="rounded-[14px] border border-border bg-surface-raised shadow-md overflow-hidden animate-scale-in">
          <div className="p-4 space-y-3">
            {/* Task name */}
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task name"
              className="w-full text-[0.9375rem] font-medium text-ink placeholder:text-clay bg-transparent outline-none"
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full text-sm text-ink-light placeholder:text-clay bg-transparent outline-none resize-none leading-relaxed"
            />

            {/* Option buttons */}
            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs text-ink-muted bg-bone hover:bg-bone-dark transition-colors">
                <CalendarDays size={13} />
                <span>Date</span>
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs text-ink-muted bg-bone hover:bg-bone-dark transition-colors">
                <Bell size={13} />
                <span>Reminder</span>
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs text-ink-muted bg-bone hover:bg-bone-dark transition-colors">
                <FolderOpen size={13} />
                <span>Personal</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-bone/30">
            <button
              onClick={() => {
                setExpanded(false);
                setName("");
                setDescription("");
              }}
              className="text-xs text-ink-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="h-7 px-3 text-xs"
            >
              Add Task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
