import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/app/date-picker";
import { ReminderSelector, type ReminderValue } from "@/components/app/reminder-selector";
import { ProjectSelector } from "@/components/app/project-selector";
import { useTaskContext, isBeyondThisWeek, todayStr } from "@/lib/task-context";
import { useAppContext } from "@/lib/app-context";
import { useSettings } from "@/lib/settings-context";
import { useProjects } from "@/hooks/use-projects";
import { useUserTier } from "@/hooks/use-user-tier";
import { Plus, Archive, Mic } from "lucide-react";
import { toast } from "sonner";
import { AiDictate } from "@/components/app/ai-dictate";

export function AddTask() {
  const { createTask } = useTaskContext();
  const { activeProject, activeView } = useAppContext();
  const { settings } = useSettings();
  const { data: projects = [] } = useProjects();
  const { data: userTier = "free" } = useUserTier();
  const [expanded, setExpanded] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [reminder, setReminder] = useState<ReminderValue>({ type: "none" });
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSomeday, setIsSomeday] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the default project for the current context (null when viewing "all")
  const getDefaultProject = () => (activeProject !== "all" ? activeProject : null);

  // Compute the default due date from settings
  const getDefaultDueDate = (): string | null => {
    if (settings.defaultDueDate === "today") {
      return todayStr();
    }
    if (settings.defaultDueDate === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    return null;
  };

  // When form expands, focus input and set defaults
  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus();
      // Set project: use active project if viewing one, otherwise fall back to settings default
      if (projectId === null) {
        const contextProject = getDefaultProject();
        if (contextProject) {
          setProjectId(contextProject);
        } else if (settings.defaultProject !== "none") {
          setProjectId(settings.defaultProject);
        }
      }
      // Set due date from settings if not already set
      if (dueDate === null) {
        setDueDate(getDefaultDueDate());
      }
      setIsSomeday(activeView === "someday");
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

  // Listen for keyboard shortcut "M" to open AI dictation
  useEffect(() => {
    function handleOpenAiDictate() {
      setExpanded(false);
      setAiMode(true);
    }
    window.addEventListener("marrow:open-ai-dictate", handleOpenAiDictate);
    return () => window.removeEventListener("marrow:open-ai-dictate", handleOpenAiDictate);
  }, []);

  const resetForm = (keepProject = false, keepDate = false) => {
    setTitle("");
    setDescription("");
    if (!keepDate) setDueDate(getDefaultDueDate());
    setReminder({ type: "none" });
    setIsSomeday(activeView === "someday");
    if (!keepProject) {
      const contextProject = getDefaultProject();
      setProjectId(contextProject || (settings.defaultProject !== "none" ? settings.defaultProject : null));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const taskTitle = title.trim();

    // Fire and forget - optimistic update handles UI immediately
    createTask({
      title: taskTitle,
      description: description.trim() || undefined,
      due_date: dueDate,
      project_id: projectId || null,
      is_someday: isSomeday,
      reminder_type: reminder.type !== "none" ? reminder.type : undefined,
      reminder_time: reminder.time,
    });

    // Show confirmation toast when the task won't appear in the current main task list.
    // In today/inbox views the main list only shows today, overdue, and undated tasks —
    // anything with a future due date lands in the Weekly or Later sections instead.
    const today = todayStr();
    const hiddenFromMainList =
      (activeView === "today" || activeView === "inbox") &&
      dueDate != null &&
      dueDate > today;

    if (hiddenFromMainList) {
      const location = isBeyondThisWeek(dueDate!) ? "Later" : "This Week";
      toast("Task added", {
        description: `"${taskTitle}" was saved to ${location}`,
      });
    }

    if (isSomeday && activeView !== "someday") {
      toast("Task added", { description: `"${taskTitle}" was saved to Someday` });
    }

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
      {aiMode ? (
        <AiDictate onClose={() => setAiMode(false)} />
      ) : !expanded ? (
        /* Collapsed state */
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-[14px] border border-dashed border-clay-light/60 text-clay hover:border-ember/40 hover:text-ember/60 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-transform group-hover:scale-110">
              <Plus size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm">Add a task&#8230;</span>
            <kbd className="ml-auto hidden sm:inline text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
              N
            </kbd>
          </button>
          <button
            onClick={() => setAiMode(true)}
            title="Create tasks with AI"
            aria-label="Create tasks with AI"
            className="py-3.5 px-3.5 rounded-[14px] flex items-center gap-1.5 justify-center text-clay bg-surface-raised border border-border-subtle hover:text-ember hover:border-border transition-all duration-200 shrink-0"
          >
            <kbd className="hidden sm:inline text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">M</kbd>
            <Mic size={20} />
          </button>
        </div>
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
            <div className="flex flex-wrap items-center gap-1.5">
              <DatePicker
                value={dueDate}
                onChange={(date) => {
                  setDueDate(date);
                  if (date) setIsSomeday(false);
                }}
                compact
              />
              <ReminderSelector value={reminder} onChange={setReminder} compact userTier={userTier} />
              <ProjectSelector
                value={projectId || ""}
                onChange={setProjectId}
                projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
                compact
              />
              <div className="sm:hidden w-full" />
              <button
                type="button"
                onClick={() => {
                  setIsSomeday((v) => {
                    if (!v) setDueDate(null);
                    return !v;
                  });
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-[8px] text-xs transition-colors ${
                  isSomeday
                    ? "bg-ember/10 text-ember border border-ember/30"
                    : "text-clay hover:text-ink border border-transparent hover:border-border"
                }`}
              >
                <Archive size={13} />
                Someday
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-bone/30">
            <div className="flex items-center gap-2">
              <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
                Esc
              </kbd>
              <button
                onClick={() => {
                  setExpanded(false);
                  resetForm(false, false);
                }}
                className="text-xs text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="text-[10px] text-clay bg-bone border border-border-subtle rounded px-1.5 py-0.5 font-mono">
                ↵
              </kbd>
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
        </div>
      )}
    </div>
  );
}
