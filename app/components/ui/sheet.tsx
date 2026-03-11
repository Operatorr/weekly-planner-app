import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "sheet-overlay fixed inset-0 z-50 bg-black/50",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
    title?: string;
  }
>(({ side = "left", className, children, title = "Menu", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        "fixed z-50 bg-surface-raised shadow-lg",
        side === "left" && "sheet-panel-left inset-y-0 left-0 h-full w-[280px] border-r border-border-subtle",
        side === "right" && "sheet-panel-right inset-y-0 right-0 h-full w-[280px] border-l border-border-subtle",
        className
      )}
      {...props}
    >
      <VisuallyHidden>
        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
      </VisuallyHidden>
      {children}
      <DialogPrimitive.Close className="absolute right-3 top-3 rounded-[6px] p-1 text-ink-muted hover:text-ink hover:bg-bone transition-colors">
        <X size={16} />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetOverlay, SheetPortal };
