export interface SongMetadata {
  duration?: number | null
  artist?: string | null
  album?: string | null
}

export interface TPlaylistSong {
  name: string
  id: string
  playlist_name: string
  path: string
  created: number
  metadata: SongMetadata
}

