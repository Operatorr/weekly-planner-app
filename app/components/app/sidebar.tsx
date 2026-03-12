import { useMemo, useState, useRef, useEffect } from "react";
import { useAppContext, type ViewType } from "@/lib/app-context";
import { useNavigate } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskContext, normalizeDate } from "@/lib/task-context";
import { useSettings } from "@/lib/settings-context";
import { useDroppable } from "@dnd-kit/core";
import { ColorPicker } from "@/components/app/color-picker";
import type { Project } from "@/lib/types";
import {
  Sun,
  Calendar,
  Inbox,
  Clock,
  Settings,
  Plus,
  Filter,
  SlidersHorizontal,
  Palette,
  Pencil,
  Trash2,
  MoreHorizontal,
  Archive,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
}

const bottomNavItems: NavItem[] = [
  { id: "activity", label: "Activity", icon: <Clock size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { activeView, setActiveView, activeProject, setActiveProject, savedFilters, setFilterPanelOpen, activeFilter, setActiveFilter } = useAppContext();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const createProject = useCreateProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { tasks } = useTaskContext();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // State for inline editing
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // State for inline creation
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingProjectId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingProjectId]);

  // Focus input when creating starts
  useEffect(() => {
    if (isCreatingProject && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [isCreatingProject]);

  const handleStartRename = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = () => {
    if (editingProjectId && editingName.trim()) {
      updateProject({ id: editingProjectId, data: { name: editingName.trim() } });
    }
    setEditingProjectId(null);
    setEditingName("");
  };

  const handleCancelRename = () => {
    setEditingProjectId(null);
    setEditingName("");
  };

  const handleColorChange = (projectId: string, color: string) => {
    updateProject({ id: projectId, data: { color } });
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    setDeleteConfirmId(null);
    // If the deleted project was active, switch to "all"
    if (activeProject === projectId) {
      setActiveProject("all");
    }
  };

  // Calculate today's task count (active tasks due today)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTaskCount = useMemo(() => {
    return tasks.filter(
      (task) => task.due_date && normalizeDate(task.due_date) === todayStr && task.status !== "completed"
    ).length;
  }, [tasks, todayStr]);

  const upcomingTaskCount = useMemo(() => {
    return tasks.filter(
      (task) => task.due_date && normalizeDate(task.due_date) > todayStr && task.status !== "completed" && !task.is_someday
    ).length;
  }, [tasks, todayStr]);

  const somedayTaskCount = useMemo(() => {
    return tasks.filter((task) => task.is_someday && task.status !== "completed").length;
  }, [tasks]);

  const topNavItems: NavItem[] = useMemo(
    () => [
      { id: "inbox", label: "Inbox", icon: <Inbox size={18} />, description: "Every task, all at once — your complete backlog with no date filters applied." },
      { id: "today", label: "Today", icon: <Sun size={18} />, badge: settings.showTaskCountBadges ? (todayTaskCount || undefined) : undefined, description: "Tasks due today, overdue items, and undated tasks. Someday tasks are excluded." },
      { id: "upcoming", label: "Upcoming", icon: <Calendar size={18} />, badge: settings.showTaskCountBadges ? (upcomingTaskCount || undefined) : undefined, description: "Tasks with a future due date. Plan and prepare for what's ahead." },
      { id: "someday", label: "Someday", icon: <Archive size={18} />, badge: settings.showTaskCountBadges ? (somedayTaskCount || undefined) : undefined, description: "Tasks you've intentionally deferred — no deadline, no pressure, just ideas for later." },
    ],
    [todayTaskCount, upcomingTaskCount, somedayTaskCount, settings.showTaskCountBadges]
  );

  return (
    <nav className="flex-1 flex flex-col py-3 overflow-y-auto">
      {/* Top nav items */}
      <div className="px-2.5 space-y-0.5">
        {topNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeView === item.id}
            collapsed={collapsed}
            onClick={() => {
              setActiveView(item.id as ViewType);
              setActiveProject("all");
              navigate({ to: "/app" });
            }}
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
            !collapsed ? "px-2.5" : "px-0 justify-center"
          )}
        >
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-clay">
              Projects
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="w-5 h-5 rounded-[4px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
              >
                <Plus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New project</TooltipContent>
          </Tooltip>
        </div>

        {projectsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2.5 rounded-[8px]",
                  !collapsed ? "px-2.5 py-2" : "px-0 py-2 justify-center"
                )}
              >
                <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                {!collapsed && <Skeleton className="h-3.5 flex-1 rounded-[6px]" style={{ width: `${55 + i * 18}%` }} />}
              </div>
            ))
          : projects.map((project) => (
          <div
            key={project.id}
            className={cn(
              "group w-full flex items-center gap-2.5 rounded-[8px] transition-colors",
              !collapsed ? "px-2.5 py-2" : "px-0 py-2 justify-center",
              activeProject === project.id
                ? "bg-ember/8 text-ember font-medium"
                : "hover:bg-bone/60"
            )}
          >
            {editingProjectId === project.id ? (
              <>
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {!collapsed && (
                  <input
                    ref={editInputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename();
                      if (e.key === "Escape") handleCancelRename();
                    }}
                    onBlur={handleSaveRename}
                    className="flex-1 text-sm bg-white border border-ember/30 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ember/20"
                  />
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveProject(project.id);
                    setActiveView("inbox");
                    navigate({ to: "/app" });
                  }}
                  className={cn(
                    "flex items-center cursor-pointer",
                    collapsed ? "justify-center" : "gap-2.5 flex-1 min-w-0"
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  {!collapsed && (
                    <span className="text-sm truncate sidebar-label text-left">
                      {project.name}
                    </span>
                  )}
                </button>
                {!collapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-bone transition-opacity"
                      >
                        <MoreHorizontal size={14} className="text-clay" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Palette size={14} className="text-clay" />
                          <span>Change Color</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-white">
                          <ColorPicker
                            value={project.color}
                            onChange={(color) => handleColorChange(project.id, color)}
                          />
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem onClick={() => handleStartRename(project)}>
                        <Pencil size={14} className="text-clay" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {deleteConfirmId === project.id ? (
                        <DropdownMenuItem
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 size={14} />
                          <span>Confirm Delete</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteConfirmId(project.id);
                          }}
                          disabled={project.is_default}
                          className={cn(
                            !project.is_default && "text-red-600 focus:text-red-600"
                          )}
                        >
                          <Trash2 size={14} />
                          <span>{project.is_default ? "Default (cannot delete)" : "Delete"}</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        ))}

        {isCreatingProject && (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-[8px]",
              !collapsed ? "px-2.5 py-2" : "px-0 py-2 justify-center"
            )}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#6B7280" }}
            />
            {!collapsed && (
              <input
                ref={newProjectInputRef}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newProjectName.trim()) {
                    createProject.mutate({ name: newProjectName.trim() });
                    setIsCreatingProject(false);
                    setNewProjectName("");
                  }
                  if (e.key === "Escape") {
                    setIsCreatingProject(false);
                    setNewProjectName("");
                  }
                }}
                onBlur={() => {
                  if (newProjectName.trim()) {
                    createProject.mutate({ name: newProjectName.trim() });
                  }
                  setIsCreatingProject(false);
                  setNewProjectName("");
                }}
                placeholder="Project name"
                className="flex-1 text-sm bg-white border border-ember/30 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ember/20"
              />
            )}
          </div>
        )}
      </div>

      <div className="px-4 my-3">
        <Separator />
      </div>

      {/* Filters */}
      <div className="px-2.5">
        <div
          className={cn(
            "flex items-center justify-between mb-1",
            !collapsed ? "px-2.5" : "px-0 justify-center"
          )}
        >
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-wider uppercase text-clay">
              Filters
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setFilterPanelOpen(true)}
                className="w-5 h-5 rounded-[4px] flex items-center justify-center text-clay hover:text-ink-muted hover:bg-bone transition-colors"
              >
                <SlidersHorizontal size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Open filters</TooltipContent>
          </Tooltip>
        </div>

        {savedFilters.map((filter) => {
          const isActive =
            activeFilter.status === filter.config.status &&
            activeFilter.projectId === filter.config.projectId &&
            activeFilter.dateRange === filter.config.dateRange;

          return (
            <button
              key={filter.id}
              onClick={() => {
                if (isActive) {
                  setActiveFilter({});
                } else {
                  setActiveFilter(filter.config);
                  setActiveView("inbox");
                  setActiveProject("all");
                  navigate({ to: "/app" });
                }
              }}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-[8px] transition-colors cursor-pointer",
                !collapsed
                  ? "px-2.5 py-2"
                  : "px-0 py-2 justify-center",
                isActive
                  ? "bg-ember/8 text-ember font-medium"
                  : "text-ink-muted hover:bg-bone/60"
              )}
            >
              <Filter size={16} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm sidebar-label">{filter.name}</span>
              )}
            </button>
          );
        })}

        {savedFilters.length === 0 && !projectsLoading && (
          <button
            onClick={() => setFilterPanelOpen(true)}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-[8px] transition-colors text-clay hover:text-ink-muted cursor-pointer",
              !collapsed
                ? "px-2.5 py-2 hover:bg-bone/60"
                : "px-0 py-2 justify-center hover:bg-bone/60"
            )}
          >
            <Plus size={16} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm sidebar-label">Add filter</span>
            )}
          </button>
        )}
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
            collapsed={collapsed}
            onClick={() => {
              setActiveView(item.id as ViewType);
              if (item.id === "activity") {
                navigate({ to: "/app/activity" });
              } else if (item.id === "settings") {
                navigate({ to: "/app/settings" });
              } else {
                navigate({ to: "/app" });
              }
            }}
          />
        ))}
      </div>
    </nav>
  );
}

export function AppSidebar() {
  const { sidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } =
    useAppContext();

  return (
    <TooltipProvider delayDuration={300}>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "z-20 bg-surface-raised border-r border-border-subtle flex flex-col sidebar-transition overflow-hidden shrink-0",
          sidebarOpen ? "w-[240px]" : "w-[64px]",
          "hidden md:flex"
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0">
          {/* DoMarrow logo - aligned with close button */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="w-6 h-6 rounded-[6px] bg-ember flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 9L7.5 13.5L15 4.5"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              DoMarrow
            </span>
          </div>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
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
  // Make certain items drop targets for task scheduling
  const isDropTarget = ["today", "someday"].includes(item.id);
  const { setNodeRef, isOver } = useDroppable({
    id: `sidebar-${item.id}`,
    disabled: !isDropTarget,
  });

  const button = (
    <button
      ref={isDropTarget ? setNodeRef : undefined}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-[8px] transition-[color,background-color,font-weight] duration-150 cursor-pointer",
        collapsed ? "px-0 py-2.5 justify-center" : "px-2.5 py-2",
        active
          ? "bg-ember/8 text-ember font-medium"
          : "text-ink-muted hover:bg-bone/60 hover:text-ink-light",
        isOver && "bg-ember/15 ring-2 ring-ember/30"
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

  if (item.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="max-w-[200px] px-3 py-2.5">
          <p className="font-semibold text-chalk text-xs leading-tight">
            {item.label}
            {item.badge ? ` (${item.badge})` : ""}
          </p>
          <p className="text-chalk/70 text-xs leading-snug mt-1">{item.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

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
