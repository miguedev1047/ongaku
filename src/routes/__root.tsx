import i18n from '@/lib/i18n'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import { Suspense } from 'react'
import { TanstackDevtool } from '@/components/utility/tanstack-devtools'
import { PlayerRoot } from '@/features/player'
import { Toaster } from '@/components/ui/sonner'
import { useShowApp } from '@/hooks/use-show-app'
import { usePreventWebviewShortcuts } from '@/hooks/use-prevent-shortcuts'
import { usePlayerShortcuts } from '@/features/player'
import { DownloadQueueDialog } from '@/features/download-queue/components'
import { useDownloadQueueListener } from '@/features/download-queue/hooks'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, AppSidebarProvider } from '@/components/layout/app-sidebar'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { wallpaperQueryOpts } from '@/features/settings/queries/wallpaper'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/providers/theme-provider'
import { Show } from '@/components/utility/show'
import { AppBackground } from '@/components/layout/app-background'
import { cn } from 'cn'
import { useEffect } from 'react'
import { useNavShortcuts } from '@/shared/hooks/use-nav-shortcuts'

interface RouteContext {
  queryClient: QueryClient
  serverPort?: number
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent,
  beforeLoad: async ({ context }) => {
    const [config, health, wallpaper] = await Promise.all([
      context.queryClient.query(systemConfigQueryOpts()),
      context.queryClient.query(systemHealthQueryOpts()),
      context.queryClient.query(wallpaperQueryOpts()),
    ])

    const serverPort = health.serverPort

    if (config?.lang && i18n.language !== config.lang) {
      i18n.changeLanguage(config.lang)
    }
    if (config?.lang) {
      document.documentElement.setAttribute('lang', config.lang)
    }

    return { serverPort, config, health, wallpaper }
  },
})

function RootComponent() {
  useShowApp()
  useDownloadQueueListener()
  usePreventWebviewShortcuts()
  usePlayerShortcuts()
  useNavShortcuts()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  const { mode, setMode, theme, setTheme } = useTheme()

  useEffect(() => {
    if (wallpaper?.theme && wallpaper.theme !== mode) {
      setMode(wallpaper.theme)
    }
    if (wallpaper?.theme_family && wallpaper.theme_family !== theme) {
      setTheme(wallpaper.theme_family)
    }
  }, [
    wallpaper?.theme,
    wallpaper?.theme_family,
    mode,
    theme,
    setMode,
    setTheme,
  ])

  const isPlayerTop = config?.player_position === 'top'
  const hasBackground = Boolean(
    wallpaper?.selected_background &&
    wallpaper.selected_background.trim().length > 0,
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
              'flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col mx-auto container',
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
