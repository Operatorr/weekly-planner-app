import { createFileRoute } from "@tanstack/react-router";
import { useSettings, type AppSettings } from "@/lib/settings-context";
import { useProjects } from "@/hooks/use-projects";
import { cn } from "@/lib/utils";
import {
  FormInput,
  LayoutList,
  Bell,
  Monitor,
  Zap,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

// ── Toggle Switch ─────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/40",
        checked ? "bg-ember" : "bg-clay/40",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ── Segmented Control ─────────────────────────────────────────────

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg bg-bone p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150",
            value === opt.value
              ? "bg-white text-ink shadow-sm"
              : "text-clay hover:text-ink-light"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="text-xs text-ink bg-white border border-border rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-ember/30 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Setting Row ───────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
  indent,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  indent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3",
        indent && ""
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink leading-tight">
          {label}
        </p>
        {description && (
          <p className="text-xs text-clay mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border-subtle bg-bone/40">
        <span className="text-ember">{icon}</span>
        <h2 className="text-sm font-semibold text-ink tracking-tight">{title}</h2>
      </div>
      <div className="px-5 divide-y divide-border-subtle">{children}</div>
    </div>
  );
}

// ── Badge (for planned features) ──────────────────────────────────

function PlanBadge() {
  return (
    <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber/15 text-amber-700 border border-amber/20">
      Soon
    </span>
  );
}

// ── Main Settings Page ────────────────────────────────────────────

type SettingsSection = "form" | "defaults" | "display" | "behavior";

const sections: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: "form", label: "Task Form", icon: <FormInput size={15} /> },
  { id: "defaults", label: "Defaults", icon: <ChevronRight size={15} /> },
  { id: "display", label: "Display", icon: <Monitor size={15} /> },
  { id: "behavior", label: "Behavior", icon: <Zap size={15} /> },
];

function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { data: projects = [] } = useProjects();
  const [activeSection, setActiveSection] = useState<SettingsSection>("form");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    updateSetting(key, value);

  return (
    <div className="max-w-[672px] mx-auto px-4 py-8 space-y-2 animate-fade-up">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Settings</h1>
        <p className="text-sm text-clay mt-1">Customize how DoMarrow works for you.</p>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-bone rounded-xl border border-border-subtle w-fit">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
              activeSection === s.id
                ? "bg-white text-ink shadow-sm"
                : "text-clay hover:text-ink-light"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Task Form settings */}
      {activeSection === "form" && (
        <div className="space-y-3 animate-fade-up">
          <Section icon={<FormInput size={16} />} title="Task Form Behavior">
            <SettingRow
              label="Keep form open after adding"
              description="Stay in add-task mode to quickly create multiple tasks in a row."
            >
              <Toggle
                checked={!settings.autoCloseFormAfterAdd}
                onChange={(v) => update("autoCloseFormAfterAdd", !v)}
              />
            </SettingRow>

            <SettingRow
              label="Auto-close after adding"
              description="Close the form immediately after a task is added."
            >
              <Toggle
                checked={settings.autoCloseFormAfterAdd}
                onChange={(v) => update("autoCloseFormAfterAdd", v)}
              />
            </SettingRow>

            <SettingRow
              label="Keep project selection"
              description="Retain the selected project when adding the next task."
              indent
            >
              <Toggle
                checked={settings.keepProjectAfterAdd}
                onChange={(v) => update("keepProjectAfterAdd", v)}
                disabled={settings.autoCloseFormAfterAdd}
              />
            </SettingRow>

            <SettingRow
              label="Keep due date"
              description="Retain the due date when adding the next task."
              indent
            >
              <Toggle
                checked={settings.keepDueDateAfterAdd}
                onChange={(v) => update("keepDueDateAfterAdd", v)}
                disabled={settings.autoCloseFormAfterAdd}
              />
            </SettingRow>
          </Section>

          <Section icon={<LayoutList size={16} />} title="Task List Position">
            <SettingRow
              label="New tasks added to"
              description="Where newly created tasks appear in the list."
            >
              <SegmentedControl
                value={settings.newTaskPosition}
                onChange={(v) => update("newTaskPosition", v)}
                options={[
                  { value: "top", label: "Top" },
                  { value: "bottom", label: "Bottom" },
                ]}
              />
            </SettingRow>
          </Section>
        </div>
      )}

      {/* Defaults */}
      {activeSection === "defaults" && (
        <div className="space-y-3 animate-fade-up">
          <Section icon={<ChevronRight size={16} />} title="Startup Defaults">
            <SettingRow
              label="Default view on startup"
              description="Which view to open when you first launch the app."
            >
              <Select
                value={settings.defaultView}
                onChange={(v) => update("defaultView", v)}
                options={[
                  { value: "today", label: "Today" },
                  { value: "inbox", label: "Inbox" },
                  { value: "upcoming", label: "Upcoming" },
                  { value: "someday", label: "Someday" },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Default project"
              description="Pre-select a project when creating tasks from the All view."
            >
              <Select
                value={settings.defaultProject}
                onChange={(v) => update("defaultProject", v)}
                options={[
                  { value: "none", label: "None" },
                  ...projects.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Default due date"
              description="Pre-fill a due date when the form opens."
            >
              <Select
                value={settings.defaultDueDate}
                onChange={(v) => update("defaultDueDate", v)}
                options={[
                  { value: "none", label: "No default" },
                  { value: "today", label: "Today" },
                  { value: "tomorrow", label: "Tomorrow" },
                ]}
              />
            </SettingRow>
          </Section>

          <Section icon={<Bell size={16} />} title="Default Reminder">
            <SettingRow
              label="Default reminder type"
              description="Pre-select a reminder method when creating tasks."
            >
              <Select
                value={settings.defaultReminderType}
                onChange={(v) => update("defaultReminderType", v)}
                options={[
                  { value: "none", label: "No reminder" },
                  { value: "email", label: "Email" },
                  { value: "calendar", label: "Calendar" },
                ]}
              />
            </SettingRow>
          </Section>
        </div>
      )}

      {/* Display */}
      {activeSection === "display" && (
        <div className="space-y-3 animate-fade-up">
          <Section icon={<Monitor size={16} />} title="Layout & Density">
            <SettingRow
              label="Compact mode"
              description="Reduce spacing to show more tasks on screen."
            >
              <div className="flex items-center gap-2">
                <PlanBadge />
                <Toggle
                  checked={settings.compactMode}
                  onChange={(v) => update("compactMode", v)}
                  disabled
                />
              </div>
            </SettingRow>

            <SettingRow
              label="Show completed tasks"
              description="Display tasks you've already checked off."
            >
              <Toggle
                checked={settings.showCompletedTasks}
                onChange={(v) => update("showCompletedTasks", v)}
              />
            </SettingRow>

            <SettingRow
              label="Show task count badges"
              description="Display counts on sidebar navigation items."
            >
              <Toggle
                checked={settings.showTaskCountBadges}
                onChange={(v) => update("showTaskCountBadges", v)}
              />
            </SettingRow>

            <SettingRow
              label="Highlight overdue tasks"
              description="Show overdue tasks in a distinct color."
            >
              <Toggle
                checked={settings.highlightOverdueTasks}
                onChange={(v) => update("highlightOverdueTasks", v)}
              />
            </SettingRow>
          </Section>

          <Section icon={<Monitor size={16} />} title="Date & Time">
            <SettingRow
              label="Date format"
              description="How dates are shown throughout the app."
            >
              <SegmentedControl
                value={settings.dateFormat}
                onChange={(v) => update("dateFormat", v)}
                options={[
                  { value: "relative", label: "Relative" },
                  { value: "absolute", label: "Absolute" },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Week starts on"
              description="The first day of the week in calendar views."
            >
              <SegmentedControl
                value={settings.weekStartsOn}
                onChange={(v) => update("weekStartsOn", v)}
                options={[
                  { value: "sunday", label: "Sun" },
                  { value: "monday", label: "Mon" },
                ]}
              />
            </SettingRow>
          </Section>
        </div>
      )}

      {/* Behavior */}
      {activeSection === "behavior" && (
        <div className="space-y-3 animate-fade-up">
          <Section icon={<Zap size={16} />} title="Interactions">
            <SettingRow
              label="Confirm before deleting"
              description="Show a confirmation prompt before permanently deleting a task."
            >
              <Toggle
                checked={settings.confirmBeforeDelete}
                onChange={(v) => update("confirmBeforeDelete", v)}
              />
            </SettingRow>

            <SettingRow
              label="Sound on task complete"
              description="Play a subtle sound when you check off a task."
            >
              <Toggle
                checked={settings.soundOnComplete}
                onChange={(v) => update("soundOnComplete", v)}
              />
            </SettingRow>
          </Section>

          <Section icon={<RotateCcw size={16} />} title="Archive & Cleanup">
            <SettingRow
              label="Auto-archive completed tasks"
              description="Automatically hide tasks after they've been completed."
            >
              <div className="flex items-center gap-2">
                <PlanBadge />
                <Select
                  value={String(settings.autoArchiveAfterDays) as "0" | "7" | "30" | "90"}
                  onChange={(v) => update("autoArchiveAfterDays", Number(v) as 0 | 7 | 30 | 90)}
                  options={[
                    { value: "0", label: "Never" },
                    { value: "7", label: "After 7 days" },
                    { value: "30", label: "After 30 days" },
                    { value: "90", label: "After 90 days" },
                  ]}
                />
              </div>
            </SettingRow>
          </Section>

          {/* Reset */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Reset all settings</p>
                <p className="text-xs text-clay mt-0.5">
                  Restore every setting to its factory default.
                </p>
              </div>
              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="text-xs text-clay hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      resetSettings();
                      setShowResetConfirm(false);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Yes, reset
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-clay hover:text-ink-light transition-colors px-3 py-1.5 rounded-lg hover:bg-bone border border-border"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
