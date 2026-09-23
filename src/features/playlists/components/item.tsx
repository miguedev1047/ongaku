import type { TPlaylist } from "@/shared/types/playlist.types"
import { Link } from "@tanstack/react-router"
import { PlaylistItemActions } from "./actions"

interface PlaylistItemProps {
  playlist: TPlaylist
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  return (
    <div className="w-full relative group/item">
      <Link
        to="/playlists/$playlistName"
        params={{ playlistName: playlist.name }}
        activeOptions={{ exact: true }}
        activeProps={{ className: "font-bold" }}
      >
        <div className="w-full hover:bg-accent p-2 flex items-center justify-between">
          <h2>{playlist.name}</h2>
        </div>
      </Link>

      <div className="flex absolute right-2 inset-y-0 h-full items-center">
        <PlaylistItemActions playlist={playlist} />
      </div>
    </div>
  )
}
