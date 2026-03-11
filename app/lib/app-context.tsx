import { createContext, useContext } from "react";
import type { SavedFilter, FilterConfig } from "@/components/app/filter-panel";

export interface AppContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  activeProject: string;
  setActiveProject: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  quickFindOpen: boolean;
  setQuickFindOpen: (open: boolean) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  savedFilters: SavedFilter[];
  activeFilter: FilterConfig;
  setActiveFilter: (config: FilterConfig) => void;
}

export const AppContext = createContext<AppContextValue>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  activeProject: "all",
  setActiveProject: () => {},
  activeView: "today",
  setActiveView: () => {},
  quickFindOpen: false,
  setQuickFindOpen: () => {},
  filterPanelOpen: false,
  setFilterPanelOpen: () => {},
  savedFilters: [],
  activeFilter: {},
  setActiveFilter: () => {},
});

export const useAppContext = () => useContext(AppContext);
