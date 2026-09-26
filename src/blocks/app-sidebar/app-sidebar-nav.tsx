import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { PlaylistsNav } from "@/blocks/app-sidebar/playlists-nav"
import { YoutubeSearchNavItem } from "@/blocks/app-sidebar/youtube-search-nav-item"

export function AppSidebarNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <PlaylistsNav />
          <YoutubeSearchNavItem />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
