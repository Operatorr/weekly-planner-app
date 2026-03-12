import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import { routeTree } from "./routeTree.gen";
import "@/styles/app.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

(async () => {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID,
    context: {
      kind: "user",
      key: "anonymous",
    },
  });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <LDProvider>
        <RouterProvider router={router} />
      </LDProvider>
    </StrictMode>
  );
})();
