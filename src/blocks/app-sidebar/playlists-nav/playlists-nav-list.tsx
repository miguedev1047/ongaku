import type { TPlaylist } from "@/shared/types/playlist.types"
import { CollapsibleContent } from "@/components/ui/collapsible"
import { SidebarMenuSub } from "@/components/ui/sidebar"
import { PlaylistsNavItem } from "@/blocks/app-sidebar/playlists-nav/playlists-nav-item"

interface PlaylistsNavListProps {
  playlists: TPlaylist[]
}

export function PlaylistsNavList({ playlists }: PlaylistsNavListProps) {
  return (
    <CollapsibleContent>
      <SidebarMenuSub>
        {playlists.map((playlist) => (
          <PlaylistsNavItem
            key={playlist.id}
            playlist={playlist}
          />
        ))}
      </SidebarMenuSub>
    </CollapsibleContent>
  )
}
