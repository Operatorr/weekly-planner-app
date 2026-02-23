import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TOAST_REMOVE_DELAY = 5000;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; toastId: string }
  | { type: "REMOVE_TOAST"; toastId: string };

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string, dispatch: React.Dispatch<ToastAction>) {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, 300);
  toastTimeouts.set(toastId, timeout);
}

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, 5) };
    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ) as Toast[],
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
}

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function toast(props: Omit<Toast, "id">) {
  const id = genId();
  const duration = props.duration ?? TOAST_REMOVE_DELAY;

  dispatch({ type: "ADD_TOAST", toast: { ...props, id } });

  setTimeout(() => {
    dispatch({ type: "DISMISS_TOAST", toastId: id });
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, 300);
  }, duration);

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

// --- Toast UI Components ---

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-[10px] border border-border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-fade-up data-[state=closed]:animate-fade-out",
  {
    variants: {
      variant: {
        default: "bg-surface-primary text-ink",
        destructive: "bg-red-50 border-red-200 text-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onDismiss?: () => void;
}

const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onDismiss, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      data-state="open"
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-1 top-1 rounded-[6px] p-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-70 focus:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
);
ToastComponent.displayName = "Toast";

const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-[8px] border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-bone focus:outline-none focus:ring-1 focus:ring-ember disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
      {toasts.map((t) => (
        <ToastComponent
          key={t.id}
          variant={t.variant}
          onDismiss={() => dismiss(t.id)}
        >
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          {t.action}
        </ToastComponent>
      ))}
    </div>
  );
}

export {
  toast,
  useToast,
  Toaster,
  ToastComponent as Toast,
  ToastAction,
  ToastTitle,
  ToastDescription,
  toastVariants,
};
export type { ToastActionElement };
