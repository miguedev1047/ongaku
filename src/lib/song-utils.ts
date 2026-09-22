import { SERVER_URL } from "@/constants/server"
import { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export function getCoverUrl({ song }: { song: TPlaylistSong }) {
  const url = `${SERVER_URL}/api/song-cover?path=${encodeURIComponent(song.path)}&id=${encodeURIComponent(song.id)}`
  return url
}

export function getSongUrl({ song }: { song: TPlaylistSong }) {
  const url = `${SERVER_URL}/api/song-stream?path=${encodeURIComponent(song.path)}`
  return url
}
