import { useEffect, useRef } from "react";
import { useUser } from "@clerk/react";

/**
 * Provisions a new user record + default "Personal" project on first sign-in.
 * Calls POST /api/users/provision — the API is idempotent (skips if user exists).
 */
export function useProvisionUser() {
  const { user, isLoaded } = useUser();
  const provisioned = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || provisioned.current) return;

    provisioned.current = true;

    fetch("/api/users/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || "User",
      }),
    }).catch(() => {
      // Silently fail — provisioning will be retried on next visit.
      // The API route (T04) handles idempotency.
      provisioned.current = false;
    });
  }, [isLoaded, user]);
}
