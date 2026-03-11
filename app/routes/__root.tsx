import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ClerkProvider, useAuth } from "@clerk/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineBanner } from "@/components/offline-banner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "sonner";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <AuthCacheCleaner />
        <ErrorBoundary>
          <OfflineBanner />
          <Outlet />
        </ErrorBoundary>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink)",
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "0.8125rem",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
            },
          }}
        />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

/** Clears TanStack Query cache when user signs out. */
function AuthCacheCleaner() {
  const { isSignedIn } = useAuth();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (isSignedIn) {
      wasSignedIn.current = true;
    } else if (wasSignedIn.current) {
      queryClient.clear();
      wasSignedIn.current = false;
    }
  }, [isSignedIn]);

  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="max-w-[400px] w-full text-center">
        <div className="font-display text-[8rem] leading-none font-bold text-bone-dark select-none mb-2">
          404
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Page not found
        </h1>
        <p className="text-sm text-ink-muted mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" asChild>
            <Link to="/">
              <ArrowLeft size={15} />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Go to App</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
