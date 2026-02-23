import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FolderOpen, Check } from "lucide-react";

interface ProjectOption {
  id: string;
  name: string;
  color: string;
}

interface ProjectSelectorProps {
  value: string;
  onChange: (projectId: string) => void;
  projects?: ProjectOption[];
  compact?: boolean;
}

const DEFAULT_PROJECTS: ProjectOption[] = [
  { id: "personal", name: "Personal", color: "#D4644A" },
];

export function ProjectSelector({
  value,
  onChange,
  projects = DEFAULT_PROJECTS,
  compact,
}: ProjectSelectorProps) {
  const selected = projects.find((p) => p.id === value) || projects[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-[8px] text-xs transition-colors",
            compact
              ? "px-2.5 py-1.5 bg-bone hover:bg-bone-dark text-ink-muted"
              : "px-3 py-2.5 bg-bone/40 hover:bg-bone/60 text-ink-light w-full"
          )}
        >
          <FolderOpen size={compact ? 13 : 15} className="text-clay" />
          {compact ? (
            <span style={{ color: selected?.color }}>{selected?.name || "Project"}</span>
          ) : (
            <>
              <span className="text-xs text-clay w-16">Project</span>
              <span className="text-sm" style={{ color: selected?.color }}>
                {selected?.name || "Select project"}
              </span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onChange(project.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span>{project.name}</span>
            {project.id === value && (
              <Check size={14} className="ml-auto text-ember" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
