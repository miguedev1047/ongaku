import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { type QueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { TanstackDevtool } from "@/components/tanstack-devtools"
import { PlayerRoot } from "@/blocks/player-root"
import { Toaster } from "@/components/ui/sonner"
import { useShowApp } from "@/hooks/use-show-app"
import {
  DownloadQueueDialog,
  DownloadQueueTrigger,
  useDownloadQueueListener
} from "@/features/download-queue"

interface RouteContext {
  queryClient: QueryClient
  serverPort?: number
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent,
  beforeLoad: async () => {
    const serverPort = await invoke<number>("get_server_port")
    return { serverPort }
  }
})

function RootComponent() {
  useShowApp()
  useDownloadQueueListener()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none">
      <TanstackDevtool />
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
      <DownloadQueueDialog />
      <DownloadQueueTrigger />
      <PlayerRoot />
      <Toaster />
    </div>
  )
}
