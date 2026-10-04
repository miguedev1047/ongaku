import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { YoutubeSearchNav } from "@/blocks/app-sidebar/navigations/youtube-search-nav"
import { PlaylistNav } from "@/blocks/app-sidebar/navigations/playlist-nav"
import { LibraryNav } from "@/blocks/app-sidebar/navigations/library-nav"
import { useTranslation } from "react-i18next"

export function AppSidebarNav() {
  const { t } = useTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("sidebar.navigation.label")}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <PlaylistNav />
          <LibraryNav />
          <YoutubeSearchNav />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
