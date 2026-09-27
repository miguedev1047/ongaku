import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export interface TPlaylist {
  name: string
  id: string
  path: string
  created: number
  tracks: number
  previewTracks: TPlaylistSong[]
}
