import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dev/error")({
  component: DevErrorPage,
});

function DevErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Sentry test error from /dev/error");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Sentry Error Test</h1>
      <Button variant="destructive" onClick={() => setShouldThrow(true)}>
        Throw Render Error
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          throw new Error("Sentry test: unhandled click error");
        }}
      >
        Throw Click Error
      </Button>
    </div>
  );
}
