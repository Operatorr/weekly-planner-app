import { useRef, useEffect } from "react";
import type { DemoView } from "./use-demo-tasks";
import { DEMO_PROJECTS } from "./use-demo-tasks";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { gsap } from "@/lib/gsap-config";
import { easings, colors } from "@/lib/animation-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Sun, Calendar, Cloud } from "lucide-react";

interface DemoSidebarProps {
  activeView: DemoView;
  onViewChange: (view: DemoView) => void;
  activeProject: string;
  onProjectChange: (projectId: string) => void;
  counts: {
    today: number;
    upcoming: number;
    someday: number;
  };
}

interface CategoryItemProps {
  view: DemoView;
  label: string;
  icon: React.ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

function CategoryDropZone({
  view,
  label,
  icon,
  count,
  isActive,
  onClick,
  color,
}: CategoryItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const pulseAnimation = useRef<gsap.core.Tween | null>(null);
  const reducedMotion = useReducedMotion();

  const droppableId = `category-${view}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  // GSAP drop zone animation
  useEffect(() => {
    if (!itemRef.current || reducedMotion) return;

    if (isOver) {
      pulseAnimation.current?.kill();

      gsap.to(itemRef.current, {
        scale: 1.02,
        backgroundColor: colors.emberSubtle,
        duration: 0.2,
        ease: easings.outExpo,
      });

      pulseAnimation.current = gsap.to(itemRef.current, {
        boxShadow: "0 0 20px rgba(212, 100, 74, 0.15)",
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else {
      pulseAnimation.current?.kill();
      pulseAnimation.current = null;

      gsap.to(itemRef.current, {
        scale: 1,
        backgroundColor: "",
        boxShadow: "none",
        duration: 0.2,
        ease: easings.outExpo,
        clearProps: "scale,backgroundColor,boxShadow",
      });
    }

    return () => {
      pulseAnimation.current?.kill();
    };
  }, [isOver, reducedMotion]);

  // Combine refs
  const setRefs = (node: HTMLButtonElement | null) => {
    setNodeRef(node);
    (itemRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  const colorClasses: Record<string, string> = {
    ember: "bg-ember/8 text-ember",
    sky: "bg-sky/8 text-sky",
    sage: "bg-sage/8 text-sage-dark",
    clay: "bg-clay-light/40 text-clay",
  };

  return (
    <button
      ref={setRefs}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] w-full text-left transition-colors duration-150",
        isActive
          ? `${colorClasses[color]}`
          : "text-ink-muted hover:bg-bone/60"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center",
          isActive ? colorClasses[color] : "bg-clay-light/30"
        )}
      >
        {icon}
      </div>
      <span className="text-sm font-medium flex-1">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "text-[10px] rounded-full px-1.5 py-0.5",
            isActive ? `${colorClasses[color]}` : "bg-bone text-clay"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function DemoSidebar({
  activeView,
  onViewChange,
  activeProject,
  onProjectChange,
  counts,
}: DemoSidebarProps) {
  const categories: {
    view: DemoView;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  }[] = [
    {
      view: "today",
      label: "Today",
      icon: <Sun size={10} />,
      count: counts.today,
      color: "ember",
    },
    {
      view: "upcoming",
      label: "Upcoming",
      icon: <Calendar size={10} />,
      count: counts.upcoming,
      color: "sky",
    },
    {
      view: "someday",
      label: "Someday",
      icon: <Cloud size={10} />,
      count: counts.someday,
      color: "clay",
    },
  ];

  return (
    <div className="flex flex-col w-[180px] border-r border-border-subtle p-3 gap-1">
      {/* Category navigation */}
      {categories.map((cat) => (
        <CategoryDropZone
          key={cat.view}
          view={cat.view}
          label={cat.label}
          icon={cat.icon}
          count={cat.count}
          isActive={activeView === cat.view}
          onClick={() => onViewChange(cat.view)}
          color={cat.color}
        />
      ))}

      {/* Divider */}
      <div className="my-2 h-px bg-border-subtle" />

      {/* Projects section */}
      <div className="text-[10px] font-semibold tracking-wider uppercase text-clay px-2.5 mb-1">
        Projects
      </div>

      {/* All projects */}
      <button
        onClick={() => onProjectChange("all")}
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] w-full text-left transition-colors duration-150",
          activeProject === "all"
            ? "bg-bone text-ink"
            : "text-ink-muted hover:bg-bone/60"
        )}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-ember to-sky" />
        <span className="text-sm">All</span>
      </button>

      {/* Individual projects */}
      {DEMO_PROJECTS.map((project) => (
        <button
          key={project.id}
          onClick={() => onProjectChange(project.id)}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] w-full text-left transition-colors duration-150",
            activeProject === project.id
              ? "bg-bone text-ink"
              : "text-ink-muted hover:bg-bone/60"
          )}
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm">{project.name}</span>
        </button>
      ))}
    </div>
  );
}
