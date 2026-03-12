import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack ?? "" } } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-6">
          <div className="max-w-[400px] w-full text-center">
            <div className="w-16 h-16 rounded-full bg-ember/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-ember" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-ink-muted mb-8 leading-relaxed">
              An unexpected error occurred. Please try again — if the problem
              persists, try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-clay bg-bone rounded-[10px] p-4 mb-6 text-left overflow-auto max-h-[120px]">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={this.handleRetry} className="gap-2">
                <RefreshCw size={15} />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
