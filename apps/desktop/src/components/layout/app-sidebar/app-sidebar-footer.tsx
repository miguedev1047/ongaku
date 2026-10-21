import { SidebarMenu } from "@ongaku/ui"
import { SettingsNav } from "@/components/layout/app-sidebar/navigations/settings-nav"
import { SidebarDownloadQueue } from "@/components/layout/app-sidebar/components/download-queue"


export function AppSidebarFooter() {
  return (
    <SidebarMenu>
      <SidebarDownloadQueue />
      <SettingsNav />
    </SidebarMenu>
  )
}
