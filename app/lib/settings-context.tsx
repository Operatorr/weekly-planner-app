import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface AppSettings {
  // Task form behavior
  autoCloseFormAfterAdd: boolean;
  newTaskPosition: "top" | "bottom";
  keepProjectAfterAdd: boolean;
  keepDueDateAfterAdd: boolean;

  // Defaults
  defaultView: "today" | "inbox" | "upcoming" | "someday";
  defaultProject: string; // "none" or a project ID
  defaultDueDate: "none" | "today" | "tomorrow";

  // Display
  compactMode: boolean;
  showCompletedTasks: boolean;
  showTaskCountBadges: boolean;
  dateFormat: "relative" | "absolute";
  weekStartsOn: "sunday" | "monday";
  highlightOverdueTasks: boolean;

  // Reminders
  defaultReminderType: "none" | "email" | "calendar";

  // Behavior
  confirmBeforeDelete: boolean;
  autoArchiveAfterDays: 0 | 7 | 30 | 90;
  soundOnComplete: boolean;
}

const SETTINGS_KEY = "domarrow:settings";

export const defaultSettings: AppSettings = {
  autoCloseFormAfterAdd: true,
  newTaskPosition: "bottom",
  keepProjectAfterAdd: false,
  keepDueDateAfterAdd: false,
  defaultView: "today",
  defaultProject: "none",
  defaultDueDate: "none",
  compactMode: false,
  showCompletedTasks: true,
  showTaskCountBadges: true,
  dateFormat: "relative",
  weekStartsOn: "sunday",
  highlightOverdueTasks: true,
  defaultReminderType: "none",
  confirmBeforeDelete: false,
  autoArchiveAfterDays: 0,
  soundOnComplete: true,
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  updateSetting: () => {},
  resetSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
