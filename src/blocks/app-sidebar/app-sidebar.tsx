import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar"
import { AppSidebarHeader } from "@/blocks/app-sidebar/app-sidebar-header"
import { AppSidebarNav } from "@/blocks/app-sidebar/app-sidebar-nav"
import { AppSidebarFooter } from "@/blocks/app-sidebar/app-sidebar-footer"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
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
