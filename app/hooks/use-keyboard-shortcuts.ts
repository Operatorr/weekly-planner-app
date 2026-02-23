import { useEffect } from "react";

interface ShortcutHandlers {
  onToggleSidebar: () => void;
  onQuickFind: () => void;
  onFocusAddTask: () => void;
}

function isTextInput(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  onToggleSidebar,
  onQuickFind,
  onFocusAddTask,
}: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + \ → toggle sidebar
      if (mod && e.key === "\\") {
        e.preventDefault();
        onToggleSidebar();
        return;
      }

      // Cmd/Ctrl + K → Quick Find
      if (mod && e.key === "k") {
        e.preventDefault();
        onQuickFind();
        return;
      }

      // N → focus Add Task input (only when not typing in a field)
      if (e.key === "n" && !mod && !e.altKey && !e.shiftKey && !isTextInput(e.target)) {
        e.preventDefault();
        onFocusAddTask();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggleSidebar, onQuickFind, onFocusAddTask]);
}
