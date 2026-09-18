import { Player } from "@renderer/components/blocks/player";
import { TanstackDevtoolsComponent } from "@renderer/components/blocks/tanstack-devtools";
import { ThemeProvider } from "@renderer/components/blocks/theme-provider";
import { Toaster } from "@renderer/components/ui/sonner";
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
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <main className="flex flex-col justify-between w-full h-screen">
        <Outlet />
        <Player />

        <Toaster />
        <TanstackDevtoolsComponent />
      </main>
    </ThemeProvider>
  );
}
