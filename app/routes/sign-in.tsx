import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/react";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <SignIn
        routing="hash"
        signUpUrl="/sign-up"
        forceRedirectUrl="/app"
      />
    </div>
  );
}
