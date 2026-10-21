import { Sidebar, SidebarContent, SidebarFooter } from '@ongaku/ui'
import { AppSidebarHeader } from '@/components/layout/app-sidebar/app-sidebar-header'
import { AppSidebarNav } from '@/components/layout/app-sidebar/app-sidebar-nav'
import { AppSidebarFooter } from '@/components/layout/app-sidebar/app-sidebar-footer'
import { wallpaperQueryOpts } from '@/features/settings/queries/wallpaper'
import { useQuery } from '@tanstack/react-query'

export function AppSidebar() {
  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  const hasBackground = Boolean(
    wallpaper?.selected_background &&
    wallpaper.selected_background.trim().length > 0,
  )

  return (
    <Sidebar
      collapsible='icon'
      variant={hasBackground ? 'translucent' : 'sidebar'}
    >
      <AppSidebarHeader />
      <SidebarContent>
        <AppSidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  )
}
