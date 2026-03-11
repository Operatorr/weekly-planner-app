import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDemoTasks, type DemoView, type DemoTask } from "./use-demo-tasks";
import { DemoSidebar } from "./demo-sidebar";
import { DemoTaskItem } from "./demo-task-item";
import { DemoWeeklyView } from "./demo-weekly-view";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
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
  const [activeTask, setActiveTask] = useState<DemoTask | null>(null);
  const [insertionInfo, setInsertionInfo] = useState<{
    overId: string;
    position: "before" | "after";
  } | null>(null);
  const reducedMotion = useReducedMotion();

  // Framer Motion values for smooth drag overlay
  const dragRotation = useMotionValue(0);
  const dragScale = useSpring(1, { stiffness: 400, damping: 30 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = (active.id as string).startsWith("week-task-")
        ? (active.id as string).replace("week-task-", "")
        : (active.id as string);
      const task = currentTasks.find((t) => t.id === activeId);
      setActiveTask(task || null);

      if (reducedMotion) return;
      dragScale.set(1.02);
      dragRotation.set(1);
    },
    [reducedMotion, currentTasks, dragScale, dragRotation]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (reducedMotion) return;
      const { delta } = event;
      const rotation = Math.min(Math.max(delta.x * 0.015, -2), 2);
      dragRotation.set(rotation);
    },
    [reducedMotion, dragRotation]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over, active } = event;
      if (!over) return;

      if (over.id === active.id) {
        setInsertionInfo(null);
        return;
      }

      const overId = over.id as string;
      // Only show insertion indicator for task-to-task reordering
      // Allow week-task- (weekly view tasks) but not day- (date columns)
      const isDayColumn = overId.startsWith("day-");
      if (
        !overId.startsWith("category-") &&
        !isDayColumn
      ) {
        const activatorEvent = event.activatorEvent as PointerEvent;
        const pointerY = activatorEvent.clientY + event.delta.y;
        const overRect = over.rect;
        const midpoint = overRect.top + overRect.height / 2;

        setInsertionInfo({
          overId,
          position: pointerY < midpoint ? "before" : "after",
        });
      } else {
        setInsertionInfo(null);
      }
    },
    []
  );

  const resetDragAnimation = useCallback(() => {
    setActiveTask(null);
    setInsertionInfo(null);

    if (reducedMotion) return;
    dragScale.set(1);
    dragRotation.set(0);
  }, [reducedMotion, dragScale, dragRotation]);

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      resetDragAnimation();
    },
    [resetDragAnimation]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      resetDragAnimation();

      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const rawActiveId = active.id as string;
      const overId = over.id as string;

      // Extract real task ID (weekly view tasks have "week-task-" prefix)
      const taskId = rawActiveId.startsWith("week-task-")
        ? rawActiveId.replace("week-task-", "")
        : rawActiveId;

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

      // Extract real over ID too
      const realOverId = overId.startsWith("week-task-")
        ? overId.replace("week-task-", "")
        : overId;

      // Handle reorder within list
      if (taskId !== realOverId) {
        reorderTasks(taskId, realOverId);
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

  const activeTasks = currentTasks.filter((t) => t.status === "active");
  const taskIds = activeTasks.map((t) => t.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* app-preview class is the GSAP animation target — must be INSIDE DndContext
          so the DragOverlay (position:fixed) isn't affected by GSAP's residual transform */}
      <div className="app-preview relative">
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
              app.domarrow.app
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
                {activeTasks.length > 0 ? (
                  activeTasks
                    .map((task, index) => {
                      let insertPosition: "before" | "after" | null = null;

                      if (insertionInfo?.overId === task.id) {
                        if (insertionInfo.position === "after") {
                          insertPosition = "after";
                        } else if (index === 0) {
                          insertPosition = "before";
                        }
                      } else if (insertionInfo?.position === "before" && index > 0) {
                        const nextTask = activeTasks[index + 1];
                        if (nextTask && insertionInfo.overId === nextTask.id) {
                          insertPosition = "after";
                        }
                      }

                      return (
                        <DemoTaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onUpdateTitle={updateTaskTitle}
                          insertPosition={insertPosition}
                        />
                      );
                    })
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
        {/* Decorative glow behind preview */}
        <div className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-b from-ember/[0.03] to-transparent blur-2xl" />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <motion.div
            data-drag-overlay
            style={{
              scale: dragScale,
              rotate: dragRotation,
              boxShadow: "0 12px 40px rgba(44, 40, 37, 0.12)",
            }}
          >
            <DemoTaskItem
              task={activeTask}
              onToggle={() => {}}
              onDelete={() => {}}
              onUpdateTitle={() => {}}
              isOverlay
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
