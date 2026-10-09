import type { VirtualItem } from '@tanstack/react-virtual'
import { TableBody } from '@/components/ui/table'
import { useTableSongsContext } from '@/components/compounds/table-songs-list/table-songs-context'
import { cn } from 'cn'

export interface TableSongsBodyProps<TRow = any> {
  className?: string
  children: (row: TRow, virtualRow: VirtualItem) => React.ReactNode
}

export function TableSongsBody<TRow = any>({
  className,
  children,
}: TableSongsBodyProps<TRow>) {
  const { rowVirtualizer, rows, scrollRef } = useTableSongsContext()

  return (
    <TableBody
      ref={scrollRef}
      className={cn(
        'flex-1 min-h-0 w-full overflow-y-auto no-scrollbar scroll-fade-y',
        className,
      )}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null

          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {children(row, virtualRow)}
            </div>
          )
        })}
      </div>
    </TableBody>
  )
}
