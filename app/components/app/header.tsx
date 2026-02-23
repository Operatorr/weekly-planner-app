import { useAppContext } from "@/lib/app-context";
import { UserButton } from "@clerk/clerk-react";
import { useIsFetching, onlineManager } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  Menu,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type SyncStatus = "synced" | "syncing" | "offline";

function useSyncStatus(): SyncStatus {
  const isFetching = useIsFetching();
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
    return () => unsubscribe();
  }, []);

  if (!isOnline) return "offline";
  if (isFetching > 0) return "syncing";
  return "synced";
}

const syncConfig: Record<SyncStatus, { color: string; label: string; animate: boolean }> = {
  synced: { color: "bg-sage", label: "Synced", animate: false },
  syncing: { color: "bg-amber", label: "Syncing\u2026", animate: true },
  offline: { color: "bg-ember", label: "Offline", animate: false },
};

export function AppHeader() {
  const { sidebarOpen, toggleSidebar, setMobileSidebarOpen } = useAppContext();
  const syncStatus = useSyncStatus();
  const sync = syncConfig[syncStatus];

  const handleQuickFind = useCallback(() => {
    window.dispatchEvent(new CustomEvent("marrow:quick-find"));
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <header className="h-14 border-b border-border-subtle bg-surface-raised flex items-center px-4 gap-3 z-30 shrink-0">
        {/* Mobile hamburger menu */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileSidebarOpen(true)}
          className="text-ink-muted hover:text-ink md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </Button>

        {/* Desktop sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              className="text-ink-muted hover:text-ink hidden md:inline-flex"
            >
              {sidebarOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeft size={18} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} &#8984;\
          </TooltipContent>
        </Tooltip>

        {/* Logo */}
        <div className="flex items-center gap-2">
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
          <span className="font-display text-base font-semibold tracking-tight text-ink hidden sm:inline">
            Marrow
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Find */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleQuickFind}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-bone hover:bg-bone-dark transition-colors text-ink-muted hover:text-ink-light cursor-pointer"
            >
              <Search size={14} />
              <span className="text-xs hidden sm:inline">Quick Find</span>
              <kbd className="hidden sm:inline text-[10px] bg-surface-raised border border-border-subtle rounded px-1.5 py-0.5 text-clay font-mono">
                &#8984;K
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Search tasks and projects</TooltipContent>
        </Tooltip>

        {/* Sync status indicator */}
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                sync.color,
                sync.animate && "animate-pulse"
              )}
            />
          </TooltipTrigger>
          <TooltipContent>{sync.label}</TooltipContent>
        </Tooltip>

        {/* Profile — Clerk UserButton */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </header>
    </TooltipProvider>
  );
}
