import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Mail, Calendar, Lock, Sparkles } from "lucide-react";
import type { UserTier } from "@/lib/types";

export type ReminderValue = {
  type: "none" | "email" | "calendar";
  time?: string;
};

interface ReminderSelectorProps {
  value: ReminderValue;
  onChange: (value: ReminderValue) => void;
  compact?: boolean;
  userTier?: UserTier;
}

const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "14:00",
  "17:00",
];

function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function ReminderSelector({ value, onChange, compact, userTier = "free" }: ReminderSelectorProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const label =
    value.type === "email"
      ? `Email ${value.time ? `at ${formatTime(value.time)}` : ""}`
      : value.type === "calendar"
        ? "Calendar"
        : "None";

  const triggerButton = (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded-[8px] text-xs transition-colors",
        compact
          ? "px-2.5 py-1.5 bg-bone hover:bg-bone-dark text-ink-muted"
          : "px-3 py-2.5 bg-bone/40 hover:bg-bone/60 text-ink-light w-full"
      )}
    >
      <Bell
        size={compact ? 13 : 15}
        className={value.type !== "none" ? "text-amber" : "text-clay"}
      />
      {compact ? (
        <span>{value.type === "none" ? "Reminder" : label}</span>
      ) : (
        <>
          <span className="text-xs text-clay w-16">Reminder</span>
          <span className="text-sm text-ink-light">{label}</span>
        </>
      )}
    </button>
  );

  // Free users see upgrade prompt
  if (userTier === "free") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {triggerButton}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px] p-0 bg-surface-raised">
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-amber-light/30 flex items-center justify-center mx-auto mb-3">
              <Lock size={16} className="text-amber" />
            </div>
            <h3 className="text-sm font-semibold text-ink mb-1">
              Reminders are a Pro feature
            </h3>
            <p className="text-xs text-ink-muted mb-4 leading-relaxed">
              Get email and calendar reminders for your tasks. Upgrade to Pro to never miss a deadline.
            </p>
            <Button variant="primary" size="sm" className="w-full gap-2" asChild>
              <Link to="/pricing">
                <Sparkles size={14} />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Pro users see normal reminder options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => onChange({ type: "none" })}
        >
          <BellOff size={14} className="text-clay" />
          <span>None</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onChange({ type: "email", time: value.time || "09:00" })}
        >
          <Mail size={14} className="text-clay" />
          <span>Email reminder</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChange({ type: "calendar" })}
        >
          <Calendar size={14} className="text-clay" />
          <span>Add to calendar</span>
        </DropdownMenuItem>
        {value.type === "email" && (
          <>
            <DropdownMenuSeparator />
            {TIMES.map((time) => (
              <DropdownMenuItem
                key={time}
                onClick={() => onChange({ type: "email", time })}
              >
                <span className={cn("text-xs", value.time === time && "text-ember font-medium")}>
                  {formatTime(time)}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
