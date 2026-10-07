import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppSidebarHeader } from '@/blocks/app-sidebar/app-sidebar-header'
import { AppSidebarNav } from '@/blocks/app-sidebar/app-sidebar-nav'
import { AppSidebarFooter } from '@/blocks/app-sidebar/app-sidebar-footer'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useQuery } from '@tanstack/react-query'
import { cn } from 'cn'

export function AppSidebar() {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const hasBackground = Boolean(
    config?.app_background && config.app_background.trim().length > 0,
  )

  return (
    <Sidebar
      collapsible='icon'
      className={cn(hasBackground && 'bg-sidebar/40 backdrop-blur-md')}
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
