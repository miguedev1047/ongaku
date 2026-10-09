import { Checkbox } from '@/components/ui/checkbox'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TABLE_SONGS_SLOTS } from '@/components/compounds/table-songs-list/table-songs-constants'
import { useTableSongsContext } from '@/components/compounds/table-songs-list/table-songs-context'
import { Subscribe } from '@tanstack/react-table'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export interface TableSongsHeaderProps {
  className?: string
  rowClassName?: string
  children: React.ReactNode
}

export function TableSongsHeader({
  className,
  rowClassName,
  children,
}: TableSongsHeaderProps) {
  return (
    <TableHeader
      className={cn(
        'shrink-0 bg-muted/20 border-b border-border/40',
        className,
      )}
    >
      <TableRow
        className={cn(
          'border-b-0 hover:bg-transparent px-3 h-10 gap-3',
          rowClassName,
        )}
      >
        {children}
      </TableRow>
    </TableHeader>
  )
}

export function TableSongsHeaderSelectAll({
  className,
  ariaLabel,
}: {
  className?: string
  ariaLabel?: string
}) {
  const { table } = useTableSongsContext()
  const { t } = useTranslation()

  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.selectHead, className)}>
      <Subscribe
        source={table.atoms.rowSelection}
        selector={() => table.getIsAllRowsSelected()}
      >
        {(isAllSelected) => (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => table.toggleAllRowsSelected()}
            aria-label={ariaLabel ?? t('common.select_all_songs')}
          />
        )}
      </Subscribe>
    </TableHead>
  )
}

export function TableSongsHeaderCover({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.coverHead, className)}>
      {label ?? t('library.columns.cover')}
    </TableHead>
  )
}

export function TableSongsHeaderTitle({
  title,
  className,
}: {
  title?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.titleHead, className)}>
      <span>{title ?? t('library.columns.title')}</span>
    </TableHead>
  )
}

export function TableSongsHeaderArtist({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.artistHead, className)}>
      {label ?? t('library.columns.artist')}
    </TableHead>
  )
}

export function TableSongsHeaderAlbum({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.albumHead, className)}>
      {label ?? t('library.columns.album')}
    </TableHead>
  )
}

export function TableSongsHeaderDuration({
  label,
  className,
}: {
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.durationHead, className)}>
      {label ?? t('library.columns.duration')}
    </TableHead>
  )
}

export function TableSongsHeaderActions({ className }: { className?: string }) {
  return <TableHead className={cn(TABLE_SONGS_SLOTS.actionsHead, className)} />
}

TableSongsHeader.SelectAll = TableSongsHeaderSelectAll
TableSongsHeader.Cover = TableSongsHeaderCover
TableSongsHeader.Title = TableSongsHeaderTitle
TableSongsHeader.Artist = TableSongsHeaderArtist
TableSongsHeader.Album = TableSongsHeaderAlbum
TableSongsHeader.Duration = TableSongsHeaderDuration
TableSongsHeader.Actions = TableSongsHeaderActions
