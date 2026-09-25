import { create } from "zustand"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

interface StreamingBatchState {
  selectedMap: Record<string, TYoutubeSearchResult>
  toggleSelect: (item: TYoutubeSearchResult) => void
  selectMultiple: (items: TYoutubeSearchResult[]) => void
  selectAll: (items: TYoutubeSearchResult[]) => void
  deselectAll: () => void
  clear: () => void
  getSelectedList: () => TYoutubeSearchResult[]
  getSelectedCount: () => number
  isAllSelected: (items: TYoutubeSearchResult[]) => boolean
}

export const useStreamingBatchStore = create<StreamingBatchState>((set, get) => ({
  selectedMap: {},

  toggleSelect: (item) => {
    set((state) => {
      const next = { ...state.selectedMap }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        next[item.id] = item
      }
      return { selectedMap: next }
    })
  },

  selectMultiple: (items) => {
    set((state) => {
      const next = { ...state.selectedMap }
      for (const item of items) {
        next[item.id] = item
      }
      return { selectedMap: next }
    })
  },

  selectAll: (items) => {
    set((state) => {
      const allSelected =
        items.length > 0 && items.every((i) => Boolean(state.selectedMap[i.id]))
      if (allSelected) {
        return { selectedMap: {} }
      }
      const next = { ...state.selectedMap }
      for (const item of items) {
        next[item.id] = item
      }
      return { selectedMap: next }
    })
  },

  deselectAll: () => set({ selectedMap: {} }),
  clear: () => set({ selectedMap: {} }),

  getSelectedList: () => Object.values(get().selectedMap),
  getSelectedCount: () => Object.keys(get().selectedMap).length,
  isAllSelected: (items) =>
    items.length > 0 && items.every((i) => Boolean(get().selectedMap[i.id]))
}))
