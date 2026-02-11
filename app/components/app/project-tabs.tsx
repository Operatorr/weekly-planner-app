import { useAppContext } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { mockProjects } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export function ProjectTabs() {
  const { activeProject, setActiveProject } = useAppContext();

  const tabs = [
    { id: "all", name: "All" },
    ...mockProjects.map((p) => ({ id: p.id, name: p.name, color: p.color })),
  ];

  return (
    <div className="border-b border-border-subtle bg-surface-raised shrink-0">
      <div className="flex items-center px-6 gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProject(tab.id)}
            className={cn(
              "relative px-4 py-3 text-sm whitespace-nowrap transition-colors",
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

        {/* Add project button */}
        <button aria-label="Add project" className="px-3 py-3 text-clay hover:text-ink-muted transition-colors">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
