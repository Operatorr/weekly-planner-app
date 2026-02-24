import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/lib/task-context";
import { useProjects } from "@/hooks/use-projects";
import type { Task } from "@/lib/types";
import { CheckSquare, FolderOpen } from "lucide-react";

interface QuickFindProps {
  open: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectProject: (projectId: string) => void;
}

export function QuickFind({
  open,
  onClose,
  onSelectTask,
  onSelectProject,
}: QuickFindProps) {
  const [query, setQuery] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTaskContext();
  const { data: projects = [] } = useProjects();

  // Reset query when opening
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Fuse instances for fuzzy search
  const taskFuse = useMemo(
    () =>
      new Fuse(tasks, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "description", weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [tasks]
  );

  const projectFuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ["name"],
        threshold: 0.3,
        includeScore: true,
      }),
    [projects]
  );

  // Filtered results
  const taskResults = useMemo(() => {
    if (!query.trim())
      return tasks.filter((t) => t.status !== "completed").slice(0, 6);
    return taskFuse
      .search(query)
      .slice(0, 8)
      .map((r) => r.item);
  }, [query, tasks, taskFuse]);

  const projectResults = useMemo(() => {
    if (!query.trim()) return projects;
    return projectFuse
      .search(query)
      .slice(0, 4)
      .map((r) => r.item);
  }, [query, projects, projectFuse]);

  const getProjectName = useCallback(
    (projectId: string) => {
      return projects.find((p) => p.id === projectId)?.name || "";
    },
    [projects]
  );

  const handleSelect = useCallback(
    (value: string) => {
      if (value.startsWith("task:")) {
        const taskId = value.replace("task:", "");
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          onSelectTask(task);
          onClose();
        }
      } else if (value.startsWith("project:")) {
        const projectId = value.replace("project:", "");
        onSelectProject(projectId);
        onClose();
      }
    },
    [tasks, onSelectTask, onSelectProject, onClose]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-surface-overlay z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-[540px] pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <Command
            className="border border-border-subtle shadow-xl rounded-[12px] bg-surface-raised"
            shouldFilter={false}
          >
            <CommandInput
              placeholder="Search tasks and projects..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                No results found for &lsquo;{query}&rsquo;
              </CommandEmpty>

              {taskResults.length > 0 && (
                <CommandGroup heading="Tasks">
                  {taskResults.map((task) => (
                    <CommandItem
                      key={task.id}
                      value={`task:${task.id}`}
                      onSelect={handleSelect}
                    >
                      <CheckSquare
                        size={15}
                        className={cn(
                          "flex-shrink-0",
                          task.status === "completed" ? "text-sage" : "text-clay"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block truncate text-sm",
                            task.status === "completed" &&
                              "line-through text-ink-muted"
                          )}
                        >
                          {task.title}
                        </span>
                        <span className="block truncate text-xs text-clay">
                          {getProjectName(task.project_id)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {projectResults.length > 0 && (
                <CommandGroup heading="Projects">
                  {projectResults.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={`project:${project.id}`}
                      onSelect={handleSelect}
                    >
                      <FolderOpen size={15} className="flex-shrink-0 text-clay" />
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-sm">
                          {project.name}
                        </span>
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>

            {/* Footer hint */}
            <div className="border-t border-border-subtle px-4 py-2 flex items-center gap-4">
              <span className="text-[10px] text-clay flex items-center gap-1">
                <kbd className="bg-bone border border-border-subtle rounded px-1 py-0.5 font-mono text-[10px]">
                  &uarr;&darr;
                </kbd>
                navigate
              </span>
              <span className="text-[10px] text-clay flex items-center gap-1">
                <kbd className="bg-bone border border-border-subtle rounded px-1 py-0.5 font-mono text-[10px]">
                  &crarr;
                </kbd>
                select
              </span>
              <span className="text-[10px] text-clay flex items-center gap-1">
                <kbd className="bg-bone border border-border-subtle rounded px-1 py-0.5 font-mono text-[10px]">
                  esc
                </kbd>
                close
              </span>
            </div>
          </Command>
        </div>
      </div>
    </>
  );
}
