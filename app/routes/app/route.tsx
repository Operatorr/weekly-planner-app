import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { AppContext } from "@/lib/app-context";
import { AppSidebar } from "@/components/app/sidebar";
import { AppHeader } from "@/components/app/header";
import { ProjectTabs } from "@/components/app/project-tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeProject, setActiveProject] = useState("all");
  const [activeView, setActiveView] = useState("today");

  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !prev),
    []
  );

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        activeProject,
        setActiveProject,
        activeView,
        setActiveView,
      }}
    >
      <div className="h-screen flex flex-col bg-surface overflow-hidden">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all duration-300",
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
    </AppContext.Provider>
  );
}
