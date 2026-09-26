import { Playlist01Icon, YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link, useLocation } from "@tanstack/react-router"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function AppSidebarNav() {
  const pathname = useLocation({
    select: (location) => location.pathname
  })

  const isPlaylistsActive = pathname.startsWith("/playlists")
  const isYoutubeActive = pathname.startsWith("/search-youtube")

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isPlaylistsActive}
              tooltip="Playlists"
              render={<Link to="/playlists" />}
            >
              <HugeiconsIcon icon={Playlist01Icon} className="size-4 shrink-0" />
              <span>Playlists</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isYoutubeActive}
              tooltip="YouTube Search"
              render={
                <Link
                  to="/search-youtube"
                  search={{ q: "" }}
                />
              }
            >
              <HugeiconsIcon icon={YoutubeIcon} className="size-4 shrink-0" />
              <span>YouTube Search</span>
              <SidebarMenuBadge>
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 h-3.5 leading-none"
                >
                  Alpha
                </Badge>
              </SidebarMenuBadge>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
