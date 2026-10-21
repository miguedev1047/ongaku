import { useRef, useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'
import { useTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface UseTableSongsStateProps<TData> {
  data: TData[]
  columns: any
  features: any
  estimateRowSize?: number
  overscan?: number
  getRowId?: (row: TData) => string
}

export function useTableSongsState<TData extends { id: string }>({
  data,
  columns,
  features,
  estimateRowSize = 52,
  overscan = 5,
  getRowId = (row) => row.id,
}: UseTableSongsStateProps<TData>) {
  'use no memo'
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = (useTable as any)({
    features,
    columns,
    data,
    getRowId,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
  })

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowSize,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan,
  })

  return {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection,
  }
}
