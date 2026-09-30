import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_HISTORY_ITEMS = 10

export interface YoutubeSearchState {
  history: string[]
  lastQuery: string
  addSearch: (query: string) => void
  removeSearch: (query: string) => void
  clearHistory: () => void
  setLastQuery: (query: string) => void
}

export const useYoutubeSearchStore = create<YoutubeSearchState>()(
  persist(
    (set) => ({
      history: [],
      lastQuery: '',
      addSearch: (query: string) => {
        const trimmed = query.trim()
        if (!trimmed) return

        set((state) => {
          const nextHistory = [
            trimmed,
            ...state.history.filter(
              (item) => item.toLowerCase() !== trimmed.toLowerCase(),
            ),
          ].slice(0, MAX_HISTORY_ITEMS)

          return {
            history: nextHistory,
            lastQuery: trimmed,
          }
        })
      },
      removeSearch: (query: string) => {
        set((state) => ({
          history: state.history.filter((item) => item !== query),
        }))
      },
      clearHistory: () => {
        set({ history: [] })
      },
      setLastQuery: (query: string) => {
        set({ lastQuery: query.trim() })
      },
    }),
    {
      name: 'ongaku-youtube-search-history',
    },
  ),
)
