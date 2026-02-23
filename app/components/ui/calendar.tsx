import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-ink",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-0 z-10 inline-flex h-7 w-7 items-center justify-center rounded-[6px] border-0 bg-transparent text-clay hover:bg-bone hover:text-ink transition-colors cursor-pointer",
        button_next:
          "absolute right-1 top-0 z-10 inline-flex h-7 w-7 items-center justify-center rounded-[6px] border-0 bg-transparent text-clay hover:bg-bone hover:text-ink transition-colors cursor-pointer",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-clay text-[0.7rem] font-medium w-8 text-center",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "inline-flex h-8 w-8 items-center justify-center rounded-[6px] p-0 font-normal text-ink-light hover:bg-bone transition-colors cursor-pointer border-0 bg-transparent text-sm",
        selected:
          "[&>button]:bg-ember [&>button]:text-chalk [&>button]:hover:bg-ember-dark [&>button]:font-medium",
        today: "[&>button]:bg-ember/10 [&>button]:text-ember [&>button]:font-semibold",
        outside: "[&>button]:text-clay/40",
        disabled: "[&>button]:text-clay/30 [&>button]:cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight size={14} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
