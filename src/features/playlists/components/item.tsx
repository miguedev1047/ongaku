import type { TPlaylist } from "@/shared/types/playlist.types"
import { Link, useLocation } from "@tanstack/react-router"
import { PlaylistItemActions } from "@/features/playlists/components"

interface PlaylistItemProps {
  playlist: TPlaylist
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  const pathname = useLocation({
    select: (location) => location.pathname
  })
  const isSamePath = pathname
    .toLowerCase()
    .includes(playlist.name.toLowerCase())

  return (
    <div className="w-full relative group/item">
      <Link
        to="/playlists/$playlistName"
        params={{ playlistName: playlist.name }}
      >
        <h3
          data-same-path={isSamePath}
          className="p-2 w-full data-[same-path=true]:bg-accent"
        >
          {playlist.name}
        </h3>
      </Link>

      <div className="flex absolute right-2 inset-y-0 h-full items-center">
        <PlaylistItemActions playlist={playlist} />
      </div>
    </div>
  )
}
