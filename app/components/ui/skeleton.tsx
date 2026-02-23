import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[10px] bg-bone animate-[shimmer_2s_linear_infinite] bg-[length:400%_100%]",
        "bg-gradient-to-r from-bone via-bone-dark/40 to-bone",
        className
      )}
      {...props}
    />
  );
}

export function TaskItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5">
      <Skeleton className="w-[22px] h-[22px] rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-0.5 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <TaskItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function WeeklyViewSkeleton() {
  return (
    <div className="px-4">
      <div className="grid grid-cols-7 gap-1.5 min-h-[200px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-border-subtle bg-surface-raised/50 min-h-[180px]"
          >
            <div className="px-2.5 py-2 text-center border-b border-border-subtle/60">
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
            <div className="p-1 space-y-1">
              {i % 3 !== 2 && <Skeleton className="h-7 w-full" />}
              {i % 2 === 0 && <Skeleton className="h-7 w-full" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton };
