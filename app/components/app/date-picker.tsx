import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/task-context";
import { cn } from "@/lib/utils";
import { CalendarDays, X, Archive } from "lucide-react";

interface DatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  isSomeday?: boolean;
  onSomedayChange?: (isSomeday: boolean) => void;
  compact?: boolean;
}

export function DatePicker({
  value,
  onChange,
  isSomeday = false,
  onSomedayChange,
  compact,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value + "T12:00:00") : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      onChange(dateStr);
      // Selecting a date clears someday status
      onSomedayChange?.(false);
    } else {
      onChange(null);
    }
    setOpen(false);
  };

  const handleSomeday = () => {
    onChange(null); // Clear date when moving to someday
    onSomedayChange?.(true);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    onSomedayChange?.(false);
    setOpen(false);
  };

  // Display text based on state
  const getDisplayText = () => {
    if (isSomeday) return "Someday";
    if (value) return formatDate(value);
    return compact ? "Date" : "No date";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-[8px] text-xs transition-colors",
            compact
              ? "px-2.5 py-1.5 bg-bone hover:bg-bone-dark text-ink-muted"
              : "px-3 py-2.5 bg-bone/40 hover:bg-bone/60 text-ink-light w-full"
          )}
        >
          {isSomeday ? (
            <Archive size={compact ? 13 : 15} className="text-clay" />
          ) : (
            <CalendarDays
              size={compact ? 13 : 15}
              className={value ? "text-ember" : "text-clay"}
            />
          )}
          {compact ? (
            <span className={isSomeday ? "text-clay" : undefined}>
              {getDisplayText()}
            </span>
          ) : (
            <>
              <span className={cn("text-xs text-clay", !compact && "w-16")}>
                Date
              </span>
              <span
                className={cn(
                  "text-sm",
                  isSomeday ? "text-clay" : "text-ink-light"
                )}
              >
                {getDisplayText()}
              </span>
            </>
          )}
          {(value || isSomeday) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-auto w-4 h-4 rounded-full flex items-center justify-center text-clay hover:text-ink hover:bg-bone-dark transition-colors"
              aria-label="Clear date"
            >
              <X size={10} />
            </button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
        />
        <div className="px-3 pb-3 space-y-1">
          {/* Quick date options */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                onChange(today);
                onSomedayChange?.(false);
                setOpen(false);
              }}
              className="flex-1 text-xs py-1.5 px-2 rounded-md bg-bone hover:bg-bone-dark text-ink-muted transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                onChange(tomorrow.toISOString().split("T")[0]);
                onSomedayChange?.(false);
                setOpen(false);
              }}
              className="flex-1 text-xs py-1.5 px-2 rounded-md bg-bone hover:bg-bone-dark text-ink-muted transition-colors"
            >
              Tomorrow
            </button>
          </div>

          {/* Someday option */}
          {onSomedayChange && (
            <button
              onClick={handleSomeday}
              className={cn(
                "w-full flex items-center gap-2 text-xs py-2 px-2 rounded-md transition-colors",
                isSomeday
                  ? "bg-ember/10 text-ember"
                  : "hover:bg-bone text-clay hover:text-ink-muted"
              )}
            >
              <Archive size={14} />
              <span>Someday</span>
              {isSomeday && (
                <span className="ml-auto text-[10px] bg-ember/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </button>
          )}

          {/* Remove date */}
          {(value || isSomeday) && (
            <button
              onClick={handleClear}
              className="w-full text-xs text-clay hover:text-ink-muted py-1.5 transition-colors"
            >
              Remove date
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
