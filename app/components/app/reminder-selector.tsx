import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Bell, BellOff, Mail, Calendar } from "lucide-react";

export type ReminderValue = {
  type: "none" | "email" | "calendar";
  time?: string;
};

interface ReminderSelectorProps {
  value: ReminderValue;
  onChange: (value: ReminderValue) => void;
  compact?: boolean;
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

export function ReminderSelector({ value, onChange, compact }: ReminderSelectorProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const label =
    value.type === "email"
      ? `Email ${value.time ? `at ${formatTime(value.time)}` : ""}`
      : value.type === "calendar"
        ? "Calendar"
        : "None";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
