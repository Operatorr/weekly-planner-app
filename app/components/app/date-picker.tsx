import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/task-context";
import { cn } from "@/lib/utils";
import { CalendarDays, X } from "lucide-react";

interface DatePickerProps {
  value?: string | null;
  onChange: (date: string | null) => void;
  compact?: boolean;
}

export function DatePicker({ value, onChange, compact }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value + "T12:00:00") : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      onChange(dateStr);
    } else {
      onChange(null);
    }
    setOpen(false);
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
          <CalendarDays size={compact ? 13 : 15} className={value ? "text-ember" : "text-clay"} />
          {compact ? (
            <span>{value ? formatDate(value) : "Date"}</span>
          ) : (
            <>
              <span className={cn("text-xs text-clay", !compact && "w-16")}>Date</span>
              <span className="text-sm text-ink-light">
                {value ? formatDate(value) : "No date"}
              </span>
            </>
          )}
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
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
        {value && (
          <div className="px-3 pb-3">
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-xs text-clay hover:text-ink-muted py-1.5 transition-colors"
            >
              Remove date
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
