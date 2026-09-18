import { Playlist } from "@ongaku/types";
import { Link } from "@tanstack/react-router";

interface PlaylistItemProps {
  playlist: Playlist;
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  return (
    <Link
      to="/playlists/$playlistName"
      params={{ playlistName: playlist.name }}
      activeOptions={{ exact: true }}
      activeProps={{ className: "font-bold" }}
    >
      <div className="w-full hover:bg-accent">{playlist.name}</div>
    </Link>
  );
}
