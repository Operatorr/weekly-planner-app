import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { useAuth } from "@clerk/react";
import { AppContext } from "@/lib/app-context";
import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { ProjectTabs } from "@/components/app/project-tabs";
import { QuickFind } from "@/components/app/quick-find";
import { FilterPanel, type FilterConfig } from "@/components/app/filter-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { useProvisionUser } from "@/hooks/use-provision-user";
import { TaskProvider } from "@/lib/task-context";
import { ProjectProvider } from "@/lib/project-context";
import { SettingsProvider } from "@/lib/settings-context";
import { useFilters, useCreateFilter, useUpdateFilter, useDeleteFilter } from "@/hooks/use-filters";
import { useUserTier } from "@/hooks/use-user-tier";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function LoadingScreen() {
  const iconRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const icon = iconRef.current;
    if (!icon) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

    tl
      .set(icon, { y: -60, scaleX: 1, scaleY: 1, transformOrigin: "center bottom" })
      // Fall from above
      .to(icon, { y: 0, duration: 0.25, ease: "power3.in" })
      // Squash on landing
      .to(icon, { scaleX: 1.55, scaleY: 0.5, duration: 0.06, ease: "power2.out" })
      // Stretch and pop upward
      .to(icon, { scaleX: 0.8, scaleY: 1.3, y: -30, duration: 0.18, ease: "power2.out" })
      // Fall back
      .to(icon, { scaleX: 1.3, scaleY: 0.65, y: 0, duration: 0.14, ease: "power2.in" })
      // Small bounce
      .to(icon, { scaleX: 0.92, scaleY: 1.12, y: -8, duration: 0.1, ease: "power2.out" })
      // Settle
      .to(icon, { scaleX: 1, scaleY: 1, y: 0, duration: 0.1, ease: "power2.inOut" });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <div
        ref={iconRef}
        className="w-8 h-8 rounded-[8px] bg-ember flex items-center justify-center"
      >
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

// Only show project tabs on the main task view, not on settings/activity
function ProjectTabsConditional() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/app" || pathname === "/app/") return <ProjectTabs />;
  return null;
}

function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeProject, setActiveProject] = useState("all");
  const [activeView, setActiveView] = useState("today");
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterConfig>({});

  // Real filter data from API
  const { data: savedFilters = [] } = useFilters();
  const createFilterMutation = useCreateFilter();
  const updateFilterMutation = useUpdateFilter();
  const deleteFilterMutation = useDeleteFilter();
  const { data: userTier = "free" } = useUserTier();

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
      createFilterMutation.mutate({ name, config });
    },
    [createFilterMutation]
  );

  const handleUpdateFilter = useCallback(
    (id: string, name: string, config: FilterConfig) => {
      updateFilterMutation.mutate({ id, name, config });
    },
    [updateFilterMutation]
  );

  const handleDeleteFilter = useCallback(
    (id: string) => {
      deleteFilterMutation.mutate(id);
    },
    [deleteFilterMutation]
  );

  const handleApplySavedFilter = useCallback(
    (filter: { config: FilterConfig }) => {
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
    return <LoadingScreen />;
  }

  return (
    <SettingsProvider>
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
            activeFilter,
            setActiveFilter,
          }}
        >
          <div className="h-screen flex flex-col bg-surface overflow-hidden">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main
                className={cn(
                  "flex-1 min-w-0 flex flex-col min-h-0 transition-[margin] duration-300",
                  sidebarOpen ? "md:ml-[240px]" : "md:ml-[64px]"
                )}
              >
                <ProjectTabsConditional />
                <div className="flex-1 min-w-0 overflow-y-auto overscroll-contain">
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
            activeFilter={activeFilter}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
            onUpdateFilter={handleUpdateFilter}
            onDeleteFilter={handleDeleteFilter}
            onApplySavedFilter={handleApplySavedFilter}
            userTier={userTier}
          />
        </AppContext.Provider>
      </TaskProvider>
    </ProjectProvider>
    </SettingsProvider>
  );
}
