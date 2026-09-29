import { SidebarMenu } from "@/components/ui/sidebar"
import { SettingsNav } from "@/blocks/app-sidebar/navigations/settings-nav"
import { SidebarDownloadQueue } from "@/blocks/app-sidebar/components/download-queue"


export function AppSidebarFooter() {
  return (
    <SidebarMenu>
      <SidebarDownloadQueue />
      <SettingsNav />
    </SidebarMenu>
  )
}
