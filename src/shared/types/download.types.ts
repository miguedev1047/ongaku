import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'

export interface DownloadProgressPayload {
  id: string
  progress: number
  downloaded_bytes: number
  total_bytes: number
  done: boolean
}

export interface DownloadItem {
  id: string
  url: string
  title: string
  artist?: string | null
  thumbnail?: string | null
  duration?: number | null
}

export type DownloadTaskStatus =
  | 'queued'
  | 'downloading'
  | 'network-error'
  | 'error'
  | 'on-saved'
  | 'retry'
  | 'cancelled'

export interface DownloadTask {
  id: string
  item: DownloadItem
  playlistName: string
  status: DownloadTaskStatus
  progress: number
  downloadedBytes: number
  totalBytes: number
  error?: string
  resultSong?: TPlaylistSong
  queuedAt: number
}
