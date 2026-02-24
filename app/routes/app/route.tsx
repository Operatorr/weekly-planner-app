import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AppContext } from "@/lib/app-context";
import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { ProjectTabs } from "@/components/app/project-tabs";
import { QuickFind } from "@/components/app/quick-find";
import { FilterPanel, initialSavedFilters, type SavedFilter, type FilterConfig } from "@/components/app/filter-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { useProvisionUser } from "@/hooks/use-provision-user";
import { TaskProvider } from "@/lib/task-context";
import { ProjectProvider } from "@/lib/project-context";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeProject, setActiveProject] = useState("all");
  const [activeView, setActiveView] = useState("today");
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(initialSavedFilters);
  const [activeFilter, setActiveFilter] = useState<FilterConfig>({});

  // Provision user on first sign-in
  useProvisionUser();

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  }, []);

  const handleQuickFind = useCallback(() => {
    setQuickFindOpen((prev) => !prev);
  }, []);

  // Listen for marrow:quick-find events from header button
  useEffect(() => {
    const handler = () => setQuickFindOpen(true);
    window.addEventListener("marrow:quick-find", handler);
    return () => window.removeEventListener("marrow:quick-find", handler);
  }, []);

  const handleSelectTask = useCallback((_task: unknown) => {
    // TODO: wire to open task detail sheet
  }, []);

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setActiveProject(projectId);
    },
    [setActiveProject]
  );

  const handleApplyFilter = useCallback((config: FilterConfig) => {
    setActiveFilter(config);
  }, []);

  const handleSaveFilter = useCallback(
    (name: string, config: FilterConfig) => {
      const newFilter: SavedFilter = {
        id: `f${Date.now()}`,
        name,
        config,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters((prev) => [...prev, newFilter]);
    },
    []
  );

  const handleDeleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleApplySavedFilter = useCallback(
    (filter: SavedFilter) => {
      setActiveFilter(filter.config);
      setFilterPanelOpen(false);
    },
    []
  );

  const handleFocusAddTask = useCallback(() => {
    window.dispatchEvent(new CustomEvent("marrow:focus-add-task"));
  }, []);

  useKeyboardShortcuts({
    onToggleSidebar: toggleSidebar,
    onQuickFind: handleQuickFind,
    onFocusAddTask: handleFocusAddTask,
  });

  // Redirect unauthenticated users to /sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: "/sign-in" });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show nothing while Clerk loads or if not signed in (redirecting)
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 rounded-[8px] bg-ember flex items-center justify-center animate-pulse">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M3 9L7.5 13.5L15 4.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <ProjectProvider>
      <TaskProvider>
        <AppContext.Provider
          value={{
            sidebarOpen,
            toggleSidebar,
            mobileSidebarOpen,
            setMobileSidebarOpen,
            activeProject,
            setActiveProject,
            activeView,
            setActiveView,
            quickFindOpen,
            setQuickFindOpen,
            filterPanelOpen,
            setFilterPanelOpen,
            savedFilters,
          }}
        >
          <div className="h-screen flex flex-col bg-surface overflow-hidden">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main
                className={cn(
                  "flex-1 flex flex-col overflow-hidden transition-[margin] duration-300",
                  sidebarOpen ? "md:ml-[240px]" : "md:ml-[64px]"
                )}
              >
                <ProjectTabs />
                <div className="flex-1 overflow-y-auto">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>

          {/* Quick Find Modal */}
          <QuickFind
            open={quickFindOpen}
            onClose={() => setQuickFindOpen(false)}
            onSelectTask={handleSelectTask}
            onSelectProject={handleSelectProject}
          />

          {/* Filter Panel */}
          <FilterPanel
            open={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            onApplyFilter={handleApplyFilter}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
            onDeleteFilter={handleDeleteFilter}
            onApplySavedFilter={handleApplySavedFilter}
          />
        </AppContext.Provider>
      </TaskProvider>
    </ProjectProvider>
  );
}
