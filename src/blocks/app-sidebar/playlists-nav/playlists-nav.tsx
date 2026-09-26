import { useSuspenseQuery } from "@tanstack/react-query"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { Collapsible } from "@/components/ui/collapsible"
import { PlaylistsNavHeader } from "@/blocks/app-sidebar/playlists-nav/playlists-nav-header"
import { PlaylistsNavList } from "@/blocks/app-sidebar/playlists-nav/playlists-nav-list"

export function PlaylistsNav() {
  const { data: playlists } = useSuspenseQuery(playlistsQueryOpts())

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible"
    >
      <PlaylistsNavHeader />
      <PlaylistsNavList playlists={playlists} />
    </Collapsible>
  )
}
