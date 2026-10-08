import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { Suspense } from 'react'
import { TanstackDevtool } from '@/components/compounds/tanstack-devtools'
import { PlayerRoot } from '@/components/blocks/player-root'
import { Toaster } from '@/components/ui/sonner'
import { useShowApp } from '@/hooks/use-show-app'
import { usePreventWebviewShortcuts } from '@/hooks/use-prevent-shortcuts'
import { usePlayerShortcuts } from '@/hooks/use-player-shortcuts'
import { DownloadQueueDialog } from '@/features/download-queue/components'
import { useDownloadQueueListener } from '@/features/download-queue/hooks'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, AppSidebarProvider } from '@/components/blocks/app-sidebar'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { Show } from '@/components/utility/show'
import i18n from '@/lib/i18n'
import { AppBackground } from '@/components/blocks/app-background'
import { cn } from 'cn'

interface RouteContext {
  queryClient: QueryClient
  serverPort?: number
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const [config, health] = await Promise.all([
      context.queryClient.query(systemConfigQueryOpts()),
      context.queryClient.query(systemHealthQueryOpts()),
    ])

    const serverPort = health.serverPort

    if (config?.lang && i18n.language !== config.lang) {
      i18n.changeLanguage(config.lang)
    }
    if (config?.lang) {
      document.documentElement.setAttribute('lang', config.lang)
    }

    return { serverPort, config, health }
  },
})

function RootComponent() {
  useShowApp()
  useDownloadQueueListener()
  usePreventWebviewShortcuts()
  usePlayerShortcuts()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const isPlayerTop = config?.player_position === 'top'
  const hasBackground = Boolean(
    config?.app_background && config.app_background.trim().length > 0,
  )

  return (
    <AppSidebarProvider>
      <div className='h-screen w-screen flex flex-col overflow-hidden select-none'>
        <TanstackDevtool />

        {/* Top Player Position */}
        <Show when={isPlayerTop}>
          <Suspense>
            <PlayerRoot position='top' />
          </Suspense>
        </Show>

        <AppBackground>
          <AppSidebar />
          <SidebarInset
            className={cn(
              'flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col',
              hasBackground && 'bg-transparent',
            )}
          >
            <Outlet />
          </SidebarInset>
        </AppBackground>

        <DownloadQueueDialog />

        {/* Bottom Player Position (Default) */}
        <Show when={!isPlayerTop}>
          <Suspense>
            <PlayerRoot position='bottom' />
          </Suspense>
        </Show>

        <Toaster />
      </div>
    </AppSidebarProvider>
  )
}
