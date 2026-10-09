import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'

export interface DownloadSongsState {
  url: string
  items: TYoutubeSearchResult[]
  setUrl: (url: string) => void
  setItems: (items: TYoutubeSearchResult[]) => void
  clearResults: () => void
}

export const useDownloadSongsStore = create<DownloadSongsState>()(
  persist(
    (set) => ({
      url: '',
      items: [],
      setUrl: (url: string) => set({ url }),
      setItems: (items: TYoutubeSearchResult[]) => set({ items }),
      clearResults: () => set({ items: [] }),
    }),
    {
      name: 'ongaku-download-songs-session',
    },
  ),
)
