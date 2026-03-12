import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Check,
  Pencil,
  Trash2,
  FolderOpen,
  Clock,
  Lock,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/app/activity")({
  component: ActivityHistory,
});

interface ActivityEntry {
  id: string;
  type:
    | "task_created"
    | "task_completed"
    | "task_edited"
    | "task_deleted"
    | "project_created"
    | "project_renamed"
    | "project_deleted";
  description: string;
  entityName: string;
  detail?: string;
  createdAt: string;
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

// Mock activity data
const mockActivity: ActivityEntry[] = [
  {
    id: "a1",
    type: "task_created",
    description: "Created task",
    entityName: "Review quarterly goals and progress",
    createdAt: dateOffset(0),
  },
  {
    id: "a2",
    type: "task_completed",
    description: "Completed task",
    entityName: "30 minutes meditation practice",
    createdAt: dateOffset(0),
  },
  {
    id: "a3",
    type: "task_edited",
    description: "Edited task",
    entityName: "Prepare presentation slides",
    detail: "Updated description",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    type: "project_created",
    description: "Created project",
    entityName: "Personal",
    createdAt: dateOffset(-1),
  },
  // Older entries (beyond 7 days — locked for free tier)
  {
    id: "a6",
    type: "task_created",
    description: "Created task",
    entityName: "Buy groceries for the week",
    createdAt: dateOffset(-8),
  },
  {
    id: "a7",
    type: "task_edited",
    description: "Edited task",
    entityName: "Update portfolio website bio",
    detail: "Added description",
    createdAt: dateOffset(-9),
  },
  {
    id: "a8",
    type: "task_created",
    description: "Created task",
    entityName: "Call dentist for appointment",
    createdAt: dateOffset(-10),
  },
  {
    id: "a11",
    type: "task_completed",
    description: "Completed task",
    entityName: "Set up development environment",
    createdAt: dateOffset(-10),
  },
  {
    id: "a12",
    type: "task_created",
    description: "Created task",
    entityName: "Plan weekend trip",
    createdAt: dateOffset(-12),
  },
  {
    id: "a13",
    type: "project_renamed",
    description: "Renamed project",
    entityName: "Work → Personal",
    createdAt: dateOffset(-14),
  },
  {
    id: "a14",
    type: "task_edited",
    description: "Edited task",
    entityName: "Review budget spreadsheet",
    detail: "Changed due date",
    createdAt: dateOffset(-15),
  },
];

const activityIcons: Record<ActivityEntry["type"], React.ReactNode> = {
  task_created: <Plus size={14} />,
  task_completed: <Check size={14} />,
  task_edited: <Pencil size={14} />,
  task_deleted: <Trash2 size={14} />,
  project_created: <FolderOpen size={14} />,
  project_renamed: <FolderOpen size={14} />,
  project_deleted: <FolderOpen size={14} />,
};

const activityColors: Record<ActivityEntry["type"], string> = {
  task_created: "bg-sky/10 text-sky",
  task_completed: "bg-sage/10 text-sage",
  task_edited: "bg-amber/10 text-amber",
  task_deleted: "bg-red-50 text-red-500",
  project_created: "bg-ember/8 text-ember",
  project_renamed: "bg-ember/8 text-ember",
  project_deleted: "bg-red-50 text-red-500",
};

function ActivityHistory() {
  const userTier = "free";
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentEntries = mockActivity.filter(
    (entry) => new Date(entry.createdAt) >= sevenDaysAgo
  );
  const olderEntries = mockActivity.filter(
    (entry) => new Date(entry.createdAt) < sevenDaysAgo
  );

  const formatTimestamp = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  if (mockActivity.length === 0) {
    return (
      <div className="max-w-[720px] mx-auto py-12 px-4">
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-bone flex items-center justify-center mx-auto mb-4">
            <Clock size={20} className="text-clay" />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink mb-1">
            No activity yet
          </h2>
          <p className="text-sm text-ink-muted">
            Start by adding a task!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto py-6 px-4">
      {/* Header */}
      <div className="px-1 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={20} className="text-ember" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Activity
          </h1>
        </div>
        <p className="text-sm text-ink-muted">
          Your recent actions across tasks and projects.
        </p>
      </div>

      {/* Recent entries */}
      <div className="space-y-1">
        {recentEntries.map((entry, i) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 px-3 py-3 rounded-[10px] hover:bg-bone/40 transition-colors animate-fade-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${activityColors[entry.type]}`}
            >
              {activityIcons[entry.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink">
                <span className="text-ink-muted">{entry.description}</span>{" "}
                <span className="font-medium">{entry.entityName}</span>
              </p>
              {entry.detail && (
                <p className="text-xs text-clay mt-0.5">{entry.detail}</p>
              )}
            </div>
            <span className="text-xs text-clay whitespace-nowrap flex-shrink-0 pt-0.5">
              {formatTimestamp(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {/* Older entries - locked for free tier */}
      {olderEntries.length > 0 && userTier === "free" && (
        <>
          <div className="px-4 my-4">
            <Separator />
          </div>

          <div className="relative">
            {/* Blurred locked entries */}
            <div className="space-y-1 blur-[2px] select-none pointer-events-none opacity-50">
              {olderEntries.slice(0, 6).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-[10px]"
                >
                  <div
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${activityColors[entry.type]}`}
                  >
                    {activityIcons[entry.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink">
                      <span className="text-ink-muted">
                        {entry.description}
                      </span>{" "}
                      <span className="font-medium">{entry.entityName}</span>
                    </p>
                  </div>
                  <span className="text-xs text-clay whitespace-nowrap flex-shrink-0">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>

            {/* Upgrade overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-surface-raised border border-border-subtle rounded-[12px] p-6 shadow-lg text-center max-w-[320px]">
                <div className="w-10 h-10 rounded-full bg-amber-light/30 flex items-center justify-center mx-auto mb-3">
                  <Lock size={16} className="text-amber" />
                </div>
                <h3 className="text-sm font-semibold text-ink mb-1">
                  Activity history is a Pro feature
                </h3>
                <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                  Upgrade to Pro to unlock your full activity history and track
                  everything you've done across tasks and projects.
                </p>
                <Button variant="primary" size="sm" className="w-full gap-2">
                  <Sparkles size={14} />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}
