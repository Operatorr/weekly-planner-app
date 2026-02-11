import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-bone text-ink-muted",
        ember: "bg-ember/10 text-ember",
        sage: "bg-sage/10 text-sage-dark",
        sky: "bg-sky/10 text-sky",
        amber: "bg-amber/10 text-amber",
        destructive: "bg-red-50 text-red-600",
        outline: "border border-border text-ink-muted",
        coming: "bg-gradient-to-r from-ember/5 to-amber/5 text-ember border border-ember/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
