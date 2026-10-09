import type { Virtualizer } from '@tanstack/react-virtual'
import { Table } from '@/components/ui/table'
import {
  TableSongsContextProvider,
  type TableSongsContextValue,
} from '@/components/compounds/table-songs-list/table-songs-context'
import { cn } from 'cn'

export interface TableSongsListProps {
  table: any
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>
  rows: any[]
  scrollRef: React.RefObject<HTMLDivElement | null>
  footer?: React.ReactNode
  className?: string
  tableClassName?: string
  children: React.ReactNode
}

export function TableSongsList({
  table,
  rowVirtualizer,
  rows,
  scrollRef,
  footer,
  className,
  tableClassName,
  children,
}: TableSongsListProps) {
  const contextValue: TableSongsContextValue = {
    table,
    rowVirtualizer,
    rows,
    scrollRef,
  }

  return (
    <TableSongsContextProvider value={contextValue}>
      <div className={cn('size-full flex flex-col overflow-hidden', className)}>
        <Table
          variant='flex'
          className={cn(
            'size-full flex flex-col overflow-hidden rounded-md',
            tableClassName,
          )}
        >
          {children}
        </Table>
        {footer}
      </div>
    </TableSongsContextProvider>
  )
}
