import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar"
import { PlaylistsNav } from "@/blocks/app-sidebar/playlists-nav"
import { YoutubeSearchNav } from "@/blocks/app-sidebar/navigations/youtube-search-nav"
import { LibraryNav } from "./navigations/library-nav"

export function AppSidebarNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <PlaylistsNav />
          <LibraryNav />
          <YoutubeSearchNav />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
