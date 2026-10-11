import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppSidebarHeader } from '@/components/layout/app-sidebar/app-sidebar-header'
import { AppSidebarNav } from '@/components/layout/app-sidebar/app-sidebar-nav'
import { AppSidebarFooter } from '@/components/layout/app-sidebar/app-sidebar-footer'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useQuery } from '@tanstack/react-query'

export function AppSidebar() {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const hasBackground = Boolean(
    config?.app_background && config.app_background.trim().length > 0,
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
      <SidebarRail />
    </Sidebar>
  )
}
