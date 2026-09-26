import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { type QueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { TanstackDevtool } from "@/components/tanstack-devtools"
import { PlayerRoot } from "@/blocks/player-root"
import { Toaster } from "@/components/ui/sonner"
import { useShowApp } from "@/hooks/use-show-app"
import { usePreventWebviewShortcuts } from "@/hooks/use-prevent-shortcuts"
import { usePlayerShortcuts } from "@/hooks/use-player-shortcuts"
import {
  DownloadQueueDialog,
  useDownloadQueueListener
} from "@/features/download-queue"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/blocks/app-sidebar"

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
  usePreventWebviewShortcuts()
  usePlayerShortcuts()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen w-screen flex flex-col overflow-hidden select-none">
        <TanstackDevtool />
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
            <Outlet />
          </SidebarInset>
        </div>
        <DownloadQueueDialog />
        <PlayerRoot />
        <Toaster />
      </div>
    </SidebarProvider>
  )
}
