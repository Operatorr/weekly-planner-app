import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Check, X } from "lucide-react";

export function ProjectTabs() {
  const { activeProject, setActiveProject } = useAppContext();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const createProject = useCreateProject();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const tabs = [
    { id: "all", name: "All" },
    ...projects.map((p) => ({ id: p.id, name: p.name, color: p.color })),
  ];

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createProject.mutate({ name: trimmed });
    setNewName("");
    setIsCreating(false);
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setNewName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="border-b border-border-subtle bg-surface-raised shrink-0">
      <div className="flex items-center px-6 gap-1 overflow-x-auto scrollbar-none">
        {projectsLoading ? (
          <>
            {[40, 56, 48].map((w, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-3.5 rounded-[6px]" style={{ width: w }} />
              </div>
            ))}
          </>
        ) : tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProject(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm whitespace-nowrap transition-colors cursor-pointer",
              activeProject === tab.id
                ? "text-ink font-medium"
                : "text-ink-muted hover:text-ink-light"
            )}
          >
            <span className="flex items-center gap-2">
              {"color" in tab && tab.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tab.color }}
                />
              )}
              {tab.name}
            </span>

            {/* Active indicator */}
            {activeProject === tab.id && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-ember rounded-full" />
            )}
          </button>
        ))}

        {/* Inline project creation */}
        {!projectsLoading && isCreating ? (
          <div className="flex items-center gap-1 px-2 py-1.5">
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleCreateKeyDown}
              onBlur={() => {
                if (!newName.trim()) {
                  setIsCreating(false);
                }
              }}
              placeholder="Project name"
              className="w-[140px] text-sm px-2 py-1 rounded-[6px] border border-border bg-surface outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/20 text-ink placeholder:text-clay"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="p-1 rounded-[4px] text-sage hover:bg-sage/10 disabled:opacity-30 transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setNewName("");
                setIsCreating(false);
              }}
              className="p-1 rounded-[4px] text-clay hover:text-ink-muted hover:bg-bone transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : !projectsLoading ? (
          <button
            onClick={() => setIsCreating(true)}
            aria-label="Add project"
            className="px-3 py-3 text-clay hover:text-ink-muted transition-colors"
          >
            <Plus size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
