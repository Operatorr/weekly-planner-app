import { useEffect, useRef } from "react";

interface PanelEntry {
  id: string;
  close: () => void;
  skipCleanup: boolean;
}

// Shared stack across all hook instances — tracks panels with pushed history entries
const panelStack: PanelEntry[] = [];
let listenerCount = 0;

function handlePopState() {
  if (panelStack.length === 0) return;

  const top = panelStack.pop()!;
  if (!top.skipCleanup) {
    top.close();
  }
}

function addListener() {
  listenerCount++;
  if (listenerCount === 1) {
    window.addEventListener("popstate", handlePopState);
  }
}

function removeListener() {
  listenerCount--;
  if (listenerCount === 0) {
    window.removeEventListener("popstate", handlePopState);
  }
}

/**
 * Pushes a history entry when a panel opens so the browser/Android back button
 * closes the panel instead of navigating away. Handles stacking (multiple panels)
 * and cleans up history entries when panels close via other means (X, Escape, backdrop).
 */
export function useBackButtonClose(
  panelId: string,
  isOpen: boolean,
  onClose: () => void
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const prevOpenRef = useRef(false);
  const entryRef = useRef<PanelEntry | null>(null);

  useEffect(() => {
    addListener();
    return () => removeListener();
  }, []);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (!wasOpen && isOpen) {
      // Panel just opened — push history entry
      const entry: PanelEntry = {
        id: panelId,
        close: () => onCloseRef.current(),
        skipCleanup: false,
      };
      entryRef.current = entry;
      panelStack.push(entry);
      window.history.pushState({ __panel: panelId }, "");
    } else if (wasOpen && !isOpen) {
      // Panel just closed via X/Escape/backdrop — clean up stale history entry
      const entry = entryRef.current;
      if (entry) {
        const idx = panelStack.indexOf(entry);
        if (idx !== -1) {
          // Still on the stack, meaning it was closed by something other than popstate.
          // Mark skipCleanup so the popstate handler won't fire onClose again,
          // then go back to consume the stale history entry.
          entry.skipCleanup = true;
          panelStack.splice(idx, 1);
          window.history.go(-1);
        }
        entryRef.current = null;
      }
    }
  }, [isOpen, panelId]);
}
