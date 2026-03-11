import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/app/date-picker";
import { ReminderSelector, type ReminderValue } from "@/components/app/reminder-selector";
import { ProjectSelector } from "@/components/app/project-selector";
import { useTaskContext } from "@/lib/task-context";
import { useAppContext } from "@/lib/app-context";
import { useSettings } from "@/lib/settings-context";
import { useProjects } from "@/hooks/use-projects";
import { useUserTier } from "@/hooks/use-user-tier";
import { Plus } from "lucide-react";

export function AddTask() {
  const { createTask } = useTaskContext();
  const { activeProject, activeView } = useAppContext();
  const { settings } = useSettings();
  const { data: projects = [] } = useProjects();
  const { data: userTier = "free" } = useUserTier();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [reminder, setReminder] = useState<ReminderValue>({ type: "none" });
  const [projectId, setProjectId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the default project for the current context (null when viewing "all")
  const getDefaultProject = () => (activeProject !== "all" ? activeProject : null);

  // When form expands, focus input and set default project based on active view
  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
      // Set project to active project only if viewing a specific project
      if (projectId === null) {
        setProjectId(getDefaultProject());
      }
    }
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for keyboard shortcut "N" to focus/expand add task
  useEffect(() => {
    function handleFocusAddTask() {
      if (!expanded) {
        setExpanded(true);
      } else {
        inputRef.current?.focus();
      }
    }
    window.addEventListener("marrow:focus-add-task", handleFocusAddTask);
    return () => window.removeEventListener("marrow:focus-add-task", handleFocusAddTask);
  }, [expanded]);

  const resetForm = (keepProject = false, keepDate = false) => {
    setTitle("");
    setDescription("");
    if (!keepDate) setDueDate(null);
    setReminder({ type: "none" });
    if (!keepProject) setProjectId(getDefaultProject());
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    // Determine is_someday based on current view
    const isSomeday = activeView === "someday";

    // Fire and forget - optimistic update handles UI immediately
    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
      project_id: projectId || null,
      is_someday: isSomeday,
      reminder_type: reminder.type !== "none" ? reminder.type : undefined,
      reminder_time: reminder.time,
    });

    if (settings.autoCloseFormAfterAdd) {
      // Close form and reset fully
      resetForm();
      setExpanded(false);
    } else {
      // Stay open, reset only title/description, optionally keep project/date
      resetForm(settings.keepProjectAfterAdd, settings.keepDueDateAfterAdd);
      // Re-focus title input for rapid task entry
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setExpanded(false);
      resetForm(false, false);
    }
  };

  return (
    <div className="px-1">
      {!expanded ? (
        /* Collapsed state */
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border border-dashed border-clay-light/60 text-clay hover:border-ember/40 hover:text-ember/60 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-transform group-hover:scale-110">
            <Plus size={14} strokeWidth={2.5} />
          </div>
          <span className="text-sm">Add a task&#8230;</span>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task name"
              aria-label="Task name"
              name="task-name"
              autoComplete="off"
              className="w-full px-2 py-1.5 text-[0.9375rem] font-medium text-ink placeholder:text-clay bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md"
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setExpanded(false);
                  resetForm(false, false);
                }
              }}
              placeholder="Description (optional)"
              aria-label="Task description"
              name="task-description"
              rows={2}
              className="w-full px-2 py-1.5 text-sm text-ink-light placeholder:text-clay bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/30 rounded-md resize-none leading-relaxed"
            />

            {/* Option buttons */}
            <div className="flex items-center gap-1.5">
              <DatePicker value={dueDate} onChange={setDueDate} compact />
              <ReminderSelector value={reminder} onChange={setReminder} compact userTier={userTier} />
              <ProjectSelector
                value={projectId || ""}
                onChange={setProjectId}
                projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
                compact
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-bone/30">
            <button
              onClick={() => {
                setExpanded(false);
                resetForm(false, false);
              }}
              className="text-xs text-ink-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim()}
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
