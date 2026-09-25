import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface LocalBatchState {
  selectedMap: Record<string, TPlaylistSong>
  toggleSelect: (song: TPlaylistSong) => void
  selectMultiple: (songs: TPlaylistSong[]) => void
  selectAll: (songs: TPlaylistSong[]) => void
  deselectAll: () => void
  clear: () => void
  getSelectedList: () => TPlaylistSong[]
  getSelectedCount: () => number
  isAllSelected: (songs: TPlaylistSong[]) => boolean
}

export const useLocalBatchStore = create<LocalBatchState>((set, get) => ({
  selectedMap: {},

  toggleSelect: (song) => {
    set((state) => {
      const next = { ...state.selectedMap }
      if (next[song.id]) {
        delete next[song.id]
      } else {
        next[song.id] = song
      }
      return { selectedMap: next }
    })
  },

  selectMultiple: (songs) => {
    set((state) => {
      const next = { ...state.selectedMap }
      for (const song of songs) {
        next[song.id] = song
      }
      return { selectedMap: next }
    })
  },

  selectAll: (songs) => {
    set((state) => {
      const allSelected =
        songs.length > 0 && songs.every((s) => Boolean(state.selectedMap[s.id]))
      if (allSelected) {
        return { selectedMap: {} }
      }
      const next = { ...state.selectedMap }
      for (const song of songs) {
        next[song.id] = song
      }
      return { selectedMap: next }
    })
  },

  deselectAll: () => set({ selectedMap: {} }),
  clear: () => set({ selectedMap: {} }),

  getSelectedList: () => Object.values(get().selectedMap),
  getSelectedCount: () => Object.keys(get().selectedMap).length,
  isAllSelected: (songs) =>
    songs.length > 0 && songs.every((s) => Boolean(get().selectedMap[s.id]))
}))
