import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import {
  X,
  Filter,
  Calendar,
  FolderOpen,
  CheckCircle2,
  Bell,
  Save,
  Sparkles,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";

export interface FilterConfig {
  dateRange?: "today" | "thisWeek" | "nextWeek" | "throughToday" | "overdue" | "all";
  projectId?: string;
  status?: "active" | "completed" | "all";
  hasReminder?: "yes" | "no" | "any";
}

export interface SavedFilter {
  id: string;
  name: string;
  config: FilterConfig;
  createdAt: string;
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (config: FilterConfig) => void;
  activeFilter?: FilterConfig;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, config: FilterConfig) => void;
  onUpdateFilter: (id: string, name: string, config: FilterConfig) => void;
  onDeleteFilter: (id: string) => void;
  onApplySavedFilter: (filter: SavedFilter) => void;
  userTier?: "free" | "pro";
}

const dateRangeOptions = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "throughToday", label: "Through Today" },
  { value: "overdue", label: "Overdue" },
  { value: "thisWeek", label: "This Week" },
  { value: "nextWeek", label: "Next Week" },
] as const;

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const;

const reminderOptions = [
  { value: "any", label: "Any" },
  { value: "yes", label: "Has Reminder" },
  { value: "no", label: "No Reminder" },
] as const;

export function FilterPanel({
  open,
  onClose,
  onApplyFilter,
  activeFilter,
  savedFilters,
  onSaveFilter,
  onUpdateFilter,
  onDeleteFilter,
  onApplySavedFilter,
  userTier = "free",
}: FilterPanelProps) {
  const { data: projects = [] } = useProjects();

  const defaultConfig: FilterConfig = {
    dateRange: "all",
    projectId: undefined,
    status: "all",
    hasReminder: "any",
  };

  const [config, setConfig] = useState<FilterConfig>(defaultConfig);

  // Sync local config when panel opens with the current active filter
  useEffect(() => {
    if (open && activeFilter) {
      setConfig({
        dateRange: activeFilter.dateRange || "all",
        projectId: activeFilter.projectId,
        status: activeFilter.status || "all",
        hasReminder: activeFilter.hasReminder || "any",
      });
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showSave, setShowSave] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [editName, setEditName] = useState("");

  const updateConfig = useCallback(
    (patch: Partial<FilterConfig>) => {
      const next = { ...config, ...patch };
      setConfig(next);
      onApplyFilter(next);
    },
    [config, onApplyFilter]
  );

  const handleSave = useCallback(() => {
    if (userTier === "free" && savedFilters.length >= 1) {
      setShowUpgradePrompt(true);
      return;
    }
    if (!filterName.trim()) return;
    onSaveFilter(filterName.trim(), config);
    setFilterName("");
    setShowSave(false);
  }, [userTier, savedFilters.length, filterName, config, onSaveFilter]);

  const startEditing = useCallback((filter: SavedFilter) => {
    setEditingFilter(filter);
    setEditName(filter.name);
    setConfig(filter.config);
    onApplyFilter(filter.config);
  }, [onApplyFilter]);

  const cancelEditing = useCallback(() => {
    setEditingFilter(null);
    setEditName("");
    const reset: FilterConfig = {
      dateRange: "all",
      status: "all",
      hasReminder: "any",
      projectId: undefined,
    };
    setConfig(reset);
    onApplyFilter(reset);
  }, [onApplyFilter]);

  const handleUpdate = useCallback(() => {
    if (!editingFilter || !editName.trim()) return;
    onUpdateFilter(editingFilter.id, editName.trim(), config);
    setEditingFilter(null);
    setEditName("");
  }, [editingFilter, editName, config, onUpdateFilter]);

  const resetFilters = useCallback(() => {
    const reset: FilterConfig = {
      dateRange: "all",
      status: "all",
      hasReminder: "any",
      projectId: undefined,
    };
    setConfig(reset);
    onApplyFilter(reset);
    setEditingFilter(null);
    setEditName("");
  }, [onApplyFilter]);

  const isFiltering =
    config.dateRange !== "all" ||
    config.projectId !== undefined ||
    config.status !== "all" ||
    config.hasReminder !== "any";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-overlay z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] bg-surface-raised border-l border-border-subtle z-50 flex flex-col animate-slide-right shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-ember" />
            <span className="text-sm font-semibold text-ink">
              {editingFilter ? "Edit Filter" : "Filters"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isFiltering && (
              <button
                onClick={resetFilters}
                className="text-xs text-clay hover:text-ink transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-clay hover:text-ink hover:bg-bone transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Date Range */}
          <FilterSection icon={<Calendar size={15} />} label="Date Range">
            <div className="flex flex-wrap gap-1.5">
              {dateRangeOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={config.dateRange === opt.value}
                  onClick={() => updateConfig({ dateRange: opt.value })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Project */}
          <FilterSection icon={<FolderOpen size={15} />} label="Project">
            <div className="flex flex-wrap gap-1.5">
              <FilterChip
                label="All Projects"
                active={config.projectId === undefined}
                onClick={() => updateConfig({ projectId: undefined })}
              />
              {projects.map((project) => (
                <FilterChip
                  key={project.id}
                  label={project.name}
                  active={config.projectId === project.id}
                  onClick={() => updateConfig({ projectId: project.id })}
                  dot={project.color}
                />
              ))}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection icon={<CheckCircle2 size={15} />} label="Status">
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={config.status === opt.value}
                  onClick={() => updateConfig({ status: opt.value })}
                />
              ))}
            </div>
          </FilterSection>

          {/* Has Reminder */}
          <FilterSection icon={<Bell size={15} />} label="Reminder">
            <div className="flex flex-wrap gap-1.5">
              {reminderOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={config.hasReminder === opt.value}
                  onClick={() => updateConfig({ hasReminder: opt.value })}
                />
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Save / Update Filter */}
          {editingFilter ? (
            <div className="space-y-2">
              <Input
                placeholder="Filter name..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate();
                  if (e.key === "Escape") cancelEditing();
                }}
                autoFocus
                className="h-9 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={!editName.trim()}
                >
                  Update Filter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : !showSave ? (
            <Button
              variant="subtle"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                if (userTier === "free" && savedFilters.length >= 1) {
                  setShowUpgradePrompt(true);
                } else {
                  setShowSave(true);
                }
              }}
            >
              <Save size={14} />
              Save as Filter View
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setShowSave(false);
                }}
                autoFocus
                className="h-9 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={!filterName.trim()}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSave(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Upgrade Prompt */}
          {showUpgradePrompt && (
            <div className="rounded-[10px] bg-amber-light/30 border border-amber/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber" />
                <span className="text-sm font-medium text-ink">
                  Upgrade to Pro
                </span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Free accounts can save 1 filter view. Upgrade to Pro for
                unlimited saved filters.
              </p>
              <Button variant="primary" size="sm" className="w-full mt-2">
                Upgrade to Pro
              </Button>
              <button
                className="w-full text-center text-xs text-clay hover:text-ink-muted transition-colors mt-1"
                onClick={() => setShowUpgradePrompt(false)}
              >
                Maybe later
              </button>
            </div>
          )}

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-clay mb-2 block">
                Saved Filters
              </span>
              <div className="space-y-1">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-[8px] hover:bg-bone/60 transition-colors group cursor-pointer",
                      editingFilter?.id === filter.id && "bg-ember/5 ring-1 ring-ember/20"
                    )}
                    onClick={() => onApplySavedFilter(filter)}
                  >
                    <Filter size={14} className="text-clay flex-shrink-0" />
                    <span className="text-sm text-ink-light flex-1 truncate">
                      {filter.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(filter);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-clay hover:text-ember transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFilter(filter.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-clay hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterSection({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-clay">{icon}</span>
        <span className="text-xs font-medium text-ink-light">{label}</span>
      </div>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
        active
          ? "bg-ember/8 text-ember border-ember/20"
          : "bg-transparent text-ink-muted border-border-subtle hover:bg-bone/60 hover:text-ink-light"
      )}
    >
      {dot && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dot }}
        />
      )}
      {label}
    </button>
  );
}

