import "@renderer/styles/main.css";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { queryClient, QueryProvider } from "@renderer/lib/query";

import { routeTree } from "./routeTree.gen";

const hashMemory = createHashHistory();

const router = createRouter({
  routeTree,
  history: hashMemory,
  defaultPreload: "intent",
  defaultPendingMs: 0,
  context: { query: queryClient },

  defaultPendingComponent: () => <p>Loading Ongaku...</p>,
  defaultErrorComponent: () => <p>Error to load Ongaku</p>,
  Wrap: ({ children }) => <QueryProvider>{children}</QueryProvider>,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
