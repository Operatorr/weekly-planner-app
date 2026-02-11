import { createContext, useContext } from "react";

export interface AppContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeProject: string;
  setActiveProject: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const AppContext = createContext<AppContextValue>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  activeProject: "all",
  setActiveProject: () => {},
  activeView: "today",
  setActiveView: () => {},
});

export const useAppContext = () => useContext(AppContext);
