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
import {
  mockTasks as allTasks,
  mockProjects as allProjects,
  type Task,
  type Project,
} from "@/lib/mock-data";
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
      new Fuse(allTasks, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "description", weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    []
  );

  const projectFuse = useMemo(
    () =>
      new Fuse(allProjects, {
        keys: ["name"],
        threshold: 0.3,
        includeScore: true,
      }),
    []
  );

  // Filtered results
  const taskResults = useMemo(() => {
    if (!query.trim()) return allTasks.filter((t) => !t.completed).slice(0, 6);
    return taskFuse.search(query).slice(0, 8).map((r) => r.item);
  }, [query, taskFuse]);

  const projectResults = useMemo(() => {
    if (!query.trim()) return allProjects;
    return projectFuse.search(query).slice(0, 4).map((r) => r.item);
  }, [query, projectFuse]);

  const getProjectName = useCallback(
    (projectId: string) => {
      return allProjects.find((p) => p.id === projectId)?.name || "";
    },
    []
  );

  const handleSelect = useCallback(
    (value: string) => {
      if (value.startsWith("task:")) {
        const taskId = value.replace("task:", "");
        const task = allTasks.find((t) => t.id === taskId);
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
    [onSelectTask, onSelectProject, onClose]
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
                          task.completed ? "text-sage" : "text-clay"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "block truncate text-sm",
                            task.completed && "line-through text-ink-muted"
                          )}
                        >
                          {task.name}
                        </span>
                        <span className="block truncate text-xs text-clay">
                          {getProjectName(task.projectId)}
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
                        <span className="block truncate text-xs text-clay">
                          {project.taskCount}{" "}
                          {project.taskCount === 1 ? "task" : "tasks"}
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
