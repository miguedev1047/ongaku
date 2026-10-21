import { createContext, useContext } from 'react'
import type { Virtualizer } from '@tanstack/react-virtual'

export interface TableSongsContextValue {
  table: any
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  rows: any[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

const TableSongsContext = createContext<TableSongsContextValue | null>(null)

export function useTableSongsContext(): TableSongsContextValue {
  const context = useContext(TableSongsContext)
  if (!context) {
    throw new Error('useTableSongsContext must be used within <TableSongsList>')
  }
  return context
}

export const TableSongsContextProvider = TableSongsContext.Provider
