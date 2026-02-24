import { useRef, useCallback, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDemoTasks, type DemoView } from "./use-demo-tasks";
import { DemoSidebar } from "./demo-sidebar";
import { DemoTaskItem } from "./demo-task-item";
import { DemoWeeklyView } from "./demo-weekly-view";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { gsap } from "@/lib/gsap-config";
import { easings } from "@/lib/animation-presets";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function DemoAppPreview() {
  const {
    activeView,
    setActiveView,
    activeProject,
    setActiveProject,
    selectedDay,
    setSelectedDay,
    currentTasks,
    getTasksForDate,
    counts,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskTitle,
    moveTaskToCategory,
    moveTaskToDate,
    reorderTasks,
  } = useDemoTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const activeElementRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // GSAP drag animation handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (reducedMotion) return;

      const { active } = event;
      const element = document.querySelector(
        `[data-task-id="${active.id}"]`
      ) as HTMLElement;

      if (element) {
        activeElementRef.current = element;
        gsap.to(element, {
          scale: 1.02,
          boxShadow: "0 12px 40px rgba(44, 40, 37, 0.12)",
          rotation: 1,
          duration: 0.2,
          ease: easings.outExpo,
        });
      }
    },
    [reducedMotion]
  );

  const resetDragAnimation = useCallback(() => {
    if (reducedMotion || !activeElementRef.current) return;

    gsap.to(activeElementRef.current, {
      scale: 1,
      boxShadow: "0 1px 2px rgba(44, 40, 37, 0.04)",
      rotation: 0,
      duration: 0.3,
      ease: easings.spring,
      clearProps: "boxShadow,rotation,scale",
    });
    activeElementRef.current = null;
  }, [reducedMotion]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      resetDragAnimation();

      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Handle category drops (sidebar)
      if (overId.startsWith("category-")) {
        const category = overId.replace("category-", "") as DemoView;
        moveTaskToCategory(taskId, category);
        return;
      }

      // Handle day drops (weekly view)
      if (overId.startsWith("day-")) {
        const date = overId.replace("day-", "");
        moveTaskToDate(taskId, date);
        return;
      }

      // Handle reorder within list
      if (taskId !== overId) {
        reorderTasks(taskId, overId);
      }
    },
    [moveTaskToCategory, moveTaskToDate, reorderTasks, resetDragAnimation]
  );

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (trimmed) {
      addTask(trimmed);
      setNewTaskTitle("");
    }
  };

  const viewLabels: Record<DemoView, string> = {
    today: "Today",
    upcoming: "Upcoming",
    someday: "Someday",
  };

  const taskIds = currentTasks.map((t) => t.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative rounded-[20px] border border-border bg-surface-raised shadow-xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bone/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-clay-light" />
            <div className="w-2.5 h-2.5 rounded-full bg-clay-light" />
            <div className="w-2.5 h-2.5 rounded-full bg-clay-light" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-bone rounded-[6px] px-3 py-0.5 text-[10px] text-clay max-w-[200px] w-full text-center">
              app.marrowtasker.com
            </div>
          </div>
          <div className="w-[42px]" />
        </div>

        {/* App layout */}
        <div className="flex min-h-[380px]">
          {/* Sidebar */}
          <div className="hidden md:block">
            <DemoSidebar
              activeView={activeView}
              onViewChange={(view) => {
                setActiveView(view);
                setSelectedDay(null);
              }}
              activeProject={activeProject}
              onProjectChange={setActiveProject}
              counts={counts}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* View title */}
            <h2 className="text-sm font-semibold text-ink mb-3">
              {viewLabels[activeView]}
            </h2>

            {/* Add task input */}
            <form onSubmit={handleAddTask} className="mb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] border border-dashed border-clay-light text-clay hover:border-ember/40 transition-colors">
                <Plus size={16} className="text-clay-light" />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-ink placeholder:text-clay"
                />
              </div>
            </form>

            {/* Task list */}
            <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                {currentTasks.length > 0 ? (
                  currentTasks
                    .filter((t) => t.status === "active")
                    .map((task) => (
                      <DemoTaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onUpdateTitle={updateTaskTitle}
                      />
                    ))
                ) : (
                  <div className="text-center py-6 text-sm text-clay">
                    No tasks in {viewLabels[activeView].toLowerCase()}
                  </div>
                )}
              </SortableContext>

              {/* Completed tasks (collapsed) */}
              {currentTasks.filter((t) => t.status === "completed").length >
                0 && (
                <div className="pt-2 mt-2 border-t border-border-subtle">
                  <div className="text-[10px] text-clay mb-1 px-3">
                    Completed
                  </div>
                  {currentTasks
                    .filter((t) => t.status === "completed")
                    .map((task) => (
                      <DemoTaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onUpdateTitle={updateTaskTitle}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Weekly view (only show for Today view) */}
            {activeView === "today" && (
              <DemoWeeklyView
                getTasksForDate={getTasksForDate}
                selectedDay={selectedDay}
                onDayClick={setSelectedDay}
              />
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
