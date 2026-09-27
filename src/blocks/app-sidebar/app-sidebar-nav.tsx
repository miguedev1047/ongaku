import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { YoutubeSearchNav } from "@/blocks/app-sidebar/navigations/youtube-search-nav"
import { PlaylistNav } from "@/blocks/app-sidebar/navigations/playlist-nav"
import { LibraryNav } from "@/blocks/app-sidebar/navigations/library-nav"

export function AppSidebarNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
