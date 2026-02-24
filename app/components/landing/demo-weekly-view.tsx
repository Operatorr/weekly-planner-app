import { useRef, useEffect } from "react";
import type { DemoTask } from "./use-demo-tasks";
import { getWeekDays } from "./use-demo-tasks";
import { DemoWeeklyTaskItem } from "./demo-task-item";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { gsap } from "@/lib/gsap-config";
import { easings, colors } from "@/lib/animation-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface DemoWeeklyViewProps {
  getTasksForDate: (date: string) => DemoTask[];
  selectedDay: string | null;
  onDayClick: (date: string) => void;
}

function DayColumn({
  day,
  tasks,
  isSelected,
  onClick,
}: {
  day: { label: string; shortLabel: string; date: string; isToday: boolean };
  tasks: DemoTask[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const pulseAnimation = useRef<gsap.core.Tween | null>(null);
  const reducedMotion = useReducedMotion();

  const droppableId = `day-${day.date}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const taskIds = tasks.map((t) => t.id);

  // GSAP drop zone animation
  useEffect(() => {
    if (!columnRef.current || reducedMotion) return;

    if (isOver) {
      pulseAnimation.current?.kill();

      gsap.to(columnRef.current, {
        scale: 1.03,
        borderColor: colors.emberLight,
        backgroundColor: colors.emberSubtle,
        duration: 0.2,
        ease: easings.outExpo,
      });

      pulseAnimation.current = gsap.to(columnRef.current, {
        boxShadow: "0 0 20px rgba(212, 100, 74, 0.2)",
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else {
      pulseAnimation.current?.kill();
      pulseAnimation.current = null;

      gsap.to(columnRef.current, {
        scale: 1,
        borderColor: "",
        backgroundColor: "",
        boxShadow: "none",
        duration: 0.2,
        ease: easings.outExpo,
        clearProps: "scale,borderColor,backgroundColor,boxShadow",
      });
    }

    return () => {
      pulseAnimation.current?.kill();
    };
  }, [isOver, reducedMotion]);

  // Combine refs
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (columnRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={setRefs}
      onClick={onClick}
      className={cn(
        "rounded-[10px] border cursor-pointer transition-colors duration-150 min-h-[140px]",
        day.isToday
          ? "border-ember/20 bg-ember/[0.02]"
          : isSelected
            ? "border-sky/30 bg-sky/[0.02]"
            : "border-border-subtle bg-surface-raised/50 hover:border-border"
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          "px-1.5 py-1.5 text-center border-b",
          day.isToday ? "border-ember/10" : "border-border-subtle/60"
        )}
      >
        <span
          className={cn(
            "text-[10px] font-medium",
            day.isToday ? "text-ember" : isSelected ? "text-sky" : "text-ink-muted"
          )}
        >
          {day.shortLabel}
        </span>
        {day.isToday && (
          <div className="w-1 h-1 rounded-full bg-ember mx-auto mt-0.5" />
        )}
      </div>

      {/* Day tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="p-0.5 space-y-0.5">
          {tasks.slice(0, 3).map((task) => (
            <DemoWeeklyTaskItem key={task.id} task={task} />
          ))}
          {tasks.length > 3 && (
            <div className="text-[9px] text-clay text-center py-0.5">
              +{tasks.length - 3} more
            </div>
          )}
          {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center py-3">
              <span className="text-[10px] text-clay/30">&mdash;</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function DemoWeeklyView({
  getTasksForDate,
  selectedDay,
  onDayClick,
}: DemoWeeklyViewProps) {
  const weekDays = getWeekDays();

  return (
    <div className="border-t border-border-subtle pt-3 mt-3">
      <div className="text-[10px] font-semibold tracking-wider uppercase text-clay mb-2 px-1">
        This Week
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDate(day.date);

          return (
            <DayColumn
              key={day.date}
              day={day}
              tasks={dayTasks}
              isSelected={selectedDay === day.date}
              onClick={() => onDayClick(day.date)}
            />
          );
        })}
      </div>
    </div>
  );
}
