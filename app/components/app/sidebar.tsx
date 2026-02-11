import { useAppContext } from "@/lib/app-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockProjects } from "@/lib/mock-data";
import {
  Sun,
  Calendar,
  Archive,
  Inbox,
  Clock,
  Settings,
  Plus,
  Filter,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const topNavItems: NavItem[] = [
  { id: "inbox", label: "Inbox", icon: <Inbox size={18} /> },
  { id: "today", label: "Today", icon: <Sun size={18} />, badge: 3 },
  { id: "upcoming", label: "Upcoming", icon: <Calendar size={18} /> },
  { id: "someday", label: "Someday", icon: <Archive size={18} /> },
];

const bottomNavItems: NavItem[] = [
  { id: "activity", label: "Activity", icon: <Clock size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export function AppSidebar() {
  const { sidebarOpen, activeView, setActiveView } = useAppContext();

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "fixed top-14 left-0 bottom-0 z-20 bg-surface-raised border-r border-border-subtle flex flex-col sidebar-transition overflow-hidden",
          sidebarOpen ? "w-[240px]" : "w-[64px]",
          "hidden md:flex"
        )}
      >
        <nav className="flex-1 flex flex-col py-3 overflow-y-auto">
          {/* Top nav items */}
          <div className="px-2.5 space-y-0.5">
            {topNavItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeView === item.id}
                collapsed={!sidebarOpen}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </div>

          <div className="px-4 my-3">
            <Separator />
          </div>

          {/* Projects */}
          <div className="px-2.5">
            <div
              className={cn(
                "flex items-center justify-between mb-1",
                sidebarOpen ? "px-2.5" : "px-0 justify-center"
              )}
            >
              {sidebarOpen && (
                <span className="text-[10px] font-semibold tracking-wider uppercase text-clay">
                  Projects
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-5 h-5 rounded-[4px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors">
                    <Plus size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">New project</TooltipContent>
              </Tooltip>
            </div>

            {mockProjects.map((project) => (
              <button
                key={project.id}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-[8px] transition-colors",
                  sidebarOpen
                    ? "px-2.5 py-2 hover:bg-bone/60"
                    : "px-0 py-2 justify-center hover:bg-bone/60"
                )}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {sidebarOpen && (
                  <>
                    <span className="text-sm text-ink-light truncate sidebar-label">
                      {project.name}
                    </span>
                    <span className="ml-auto text-xs text-clay sidebar-label">
                      {project.taskCount}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 my-3">
            <Separator />
          </div>

          {/* Filters */}
          <div className="px-2.5">
            <div
              className={cn(
                "flex items-center justify-between mb-1",
                sidebarOpen ? "px-2.5" : "px-0 justify-center"
              )}
            >
              {sidebarOpen && (
                <span className="text-[10px] font-semibold tracking-wider uppercase text-clay">
                  Filters
                </span>
              )}
            </div>

            <button
              className={cn(
                "w-full flex items-center gap-2.5 rounded-[8px] transition-colors text-ink-muted",
                sidebarOpen
                  ? "px-2.5 py-2 hover:bg-bone/60"
                  : "px-0 py-2 justify-center hover:bg-bone/60"
              )}
            >
              <Filter size={16} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm sidebar-label">Due This Week</span>
              )}
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom nav items */}
          <div className="px-2.5 space-y-0.5 pb-2">
            <div className="px-4 mb-2">
              <Separator />
            </div>
            {bottomNavItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeView === item.id}
                collapsed={!sidebarOpen}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </div>
        </nav>
      </aside>
    </TooltipProvider>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-[8px] transition-[color,background-color,font-weight] duration-150",
        collapsed ? "px-0 py-2.5 justify-center" : "px-2.5 py-2",
        active
          ? "bg-ember/8 text-ember font-medium"
          : "text-ink-muted hover:bg-bone/60 hover:text-ink-light"
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && (
        <>
          <span className="text-sm sidebar-label">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                "ml-auto text-xs rounded-full px-1.5 py-0.5 sidebar-label",
                active ? "bg-ember/10" : "bg-bone text-clay"
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          {item.badge ? ` (${item.badge})` : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
