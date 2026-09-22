import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface DownloadsStore {
  isDownloading: boolean
  song: TPlaylistSong | null
  setIsDownloading: (isDownloading: boolean) => void
  setSong: (song: TPlaylistSong | null) => void
}

export const useDownloadsStore = create<DownloadsStore>((set) => ({
  isDownloading: false,
  song: null,
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setSong: (song) => set({ song })
}))
