import type { TPlaylistSong } from "@/features/playlist-songs/types"

export interface TPlaylist {
  name: string
  id: string
  position?: number
  created: number
  tracks: number
  previewTracks: TPlaylistSong[]
}
export interface TPlaylistAction {
  code: string
  message: string
}
