import { SidebarMenu } from "@/components/ui/sidebar"
import { SettingsNav } from "@/components/blocks/app-sidebar/navigations/settings-nav"
import { SidebarDownloadQueue } from "@/components/blocks/app-sidebar/components/download-queue"


export function AppSidebarFooter() {
  return (
    <SidebarMenu>
      <SidebarDownloadQueue />
      <SettingsNav />
    </SidebarMenu>
  )
}
