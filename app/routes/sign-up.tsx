import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/react";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <SignUp
        routing="hash"
        signInUrl="/sign-in"
        forceRedirectUrl="/app"
      />
    </div>
  );
}
