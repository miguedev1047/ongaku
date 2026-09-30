import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { Suspense } from 'react'
import { TanstackDevtool } from '@/components/tanstack-devtools'
import { PlayerRoot } from '@/blocks/player-root'
import { Toaster } from '@/components/ui/sonner'
import { useShowApp } from '@/hooks/use-show-app'
import { usePreventWebviewShortcuts } from '@/hooks/use-prevent-shortcuts'
import { usePlayerShortcuts } from '@/hooks/use-player-shortcuts'
import { DownloadQueueDialog } from '@/features/download-queue/components'
import { useDownloadQueueListener } from '@/features/download-queue/hooks'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/blocks/app-sidebar'

import { systemConfigQueryOpts } from '@/shared/queries/config'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'

import { useQuery } from '@tanstack/react-query'
import { Show } from '@/components/utility/show'

interface RouteContext {
  queryClient: QueryClient
  serverPort?: number
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const serverPort = await invoke<number>('get_server_port')
    context.queryClient.query(systemConfigQueryOpts())
    context.queryClient.query(systemHealthQueryOpts())
    return { serverPort }
  },
})

function RootComponent() {
  useShowApp()
  useDownloadQueueListener()
  usePreventWebviewShortcuts()
  usePlayerShortcuts()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const isPlayerTop = config?.player_position === 'top'

  return (
    <SidebarProvider defaultOpen={false}>
      <div className='h-screen w-screen flex flex-col overflow-hidden select-none'>
        <TanstackDevtool />

        {/* Top Player Position */}
        <Show when={isPlayerTop}>
          <Suspense>
            <PlayerRoot position='top' />
          </Suspense>
        </Show>

        <div className='flex-1 min-h-0 flex overflow-hidden'>
          <AppSidebar />
          <SidebarInset className='flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col'>
            <Outlet />
          </SidebarInset>
        </div>

        <DownloadQueueDialog />

        {/* Bottom Player Position (Default) */}
        <Show when={!isPlayerTop}>
          <Suspense>
            <PlayerRoot position='bottom' />
          </Suspense>
        </Show>

        <Toaster />
      </div>
    </SidebarProvider>
  )
}
