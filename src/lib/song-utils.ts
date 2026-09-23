import { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export function getCoverUrl({ song, port = 31047 }: { song: TPlaylistSong; port?: number }) {
  const url = `http://127.0.0.1:${port}/api/song-cover?path=${encodeURIComponent(song.path)}&id=${encodeURIComponent(song.id)}`
  return url
}

export function getSongUrl({ song, port = 31047 }: { song: TPlaylistSong; port?: number }) {
  const url = `http://127.0.0.1:${port}/api/song-stream?path=${encodeURIComponent(song.path)}`
  return url
}

