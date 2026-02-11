import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-chalk shadow-sm hover:bg-ink-light active:scale-[0.98]",
        primary:
          "bg-ember text-chalk shadow-sm hover:bg-ember-dark active:scale-[0.98]",
        outline:
          "border border-border bg-transparent text-ink hover:bg-bone active:scale-[0.98]",
        ghost:
          "text-ink-light hover:bg-bone hover:text-ink",
        link:
          "text-ember underline-offset-4 hover:underline p-0 h-auto",
        subtle:
          "bg-bone text-ink-light hover:bg-bone-dark hover:text-ink",
        destructive:
          "bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 text-[0.8125rem] gap-2",
        sm: "h-8 px-3 text-xs gap-1.5",
        lg: "h-12 px-8 text-[0.9375rem] gap-2.5",
        xl: "h-14 px-10 text-base gap-3",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
