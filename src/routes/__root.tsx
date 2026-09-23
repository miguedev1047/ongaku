import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { TanstackDevtool } from "@/components/tanstack-devtools"
import { Player } from "@/components/player/player"
import { Toaster } from "@/components/ui/sonner"
import { AppProvider } from "@/providers/app-provider"

interface RouteContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent
})

function RootComponent() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden">
        <TanstackDevtool />
        <main className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </main>
        <Player />
        <Toaster />
      </div>
    </AppProvider>
  )
}
