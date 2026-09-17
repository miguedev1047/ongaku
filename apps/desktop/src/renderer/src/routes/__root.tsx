import { TanstackDevtoolsComponent } from "@renderer/components/blocks/tanstack-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export interface RootRouteContext {
  query: QueryClient;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <main className="flex flex-col justify-between w-full h-screen">
      <Outlet />
      <TanstackDevtoolsComponent />
    </main>
  );
}
