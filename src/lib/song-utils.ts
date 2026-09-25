import { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export function getCoverUrl({
  song,
  port = 31047
}: {
  song: TPlaylistSong
  port?: number
}) {
  if (song.path.startsWith("youtube:") && song.metadata?.coverUrl) {
    return song.metadata.coverUrl
  }
  const url = `http://127.0.0.1:${port}/api/song-cover?path=${encodeURIComponent(song.path)}&id=${encodeURIComponent(song.id)}`
  return url
}

export function getSongUrl({
  song,
  port = 31047
}: {
  song: TPlaylistSong
  port?: number
}) {
  if (song.path.startsWith("youtube:")) {
    return `http://127.0.0.1:${port}/api/youtube-stream?id=${encodeURIComponent(song.id)}`
  }
  const url = `http://127.0.0.1:${port}/api/song-stream?path=${encodeURIComponent(song.path)}`
  return url
}

export function getYoutubeStreamUrl({
  id,
  port = 31047
}: {
  id: string
  port?: number
}) {
  const url = `http://127.0.0.1:${port}/api/youtube-stream?id=${encodeURIComponent(id)}`
  return url
}
