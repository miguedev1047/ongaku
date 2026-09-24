import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export interface DownloadProgress {
  progress: number
  downloaded_bytes: number
  total_bytes: number
  done: boolean
}

export interface ActiveDownload {
  title: string
  playlistName: string
}

interface DownloadsStore {
  isDownloading: boolean
  currentDownload: ActiveDownload | null
  song: TPlaylistSong | null
  downloadProgress: DownloadProgress | null
  setIsDownloading: (isDownloading: boolean) => void
  setCurrentDownload: (currentDownload: ActiveDownload | null) => void
  setSong: (song: TPlaylistSong | null) => void
  setDownloadProgress: (progress: DownloadProgress | null) => void
}

export const useDownloadsStore = create<DownloadsStore>((set) => ({
  isDownloading: false,
  currentDownload: null,
  song: null,
  downloadProgress: null,
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setCurrentDownload: (currentDownload) => set({ currentDownload }),
  setSong: (song) => set({ song }),
  setDownloadProgress: (downloadProgress) => set({ downloadProgress })
}))
