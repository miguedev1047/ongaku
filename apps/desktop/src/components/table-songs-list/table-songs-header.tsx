import { Checkbox } from '@/components/ui/checkbox'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TABLE_SONGS_SLOTS } from '@/components/table-songs-list/table-songs-constants'
import { useTableSongsContext } from '@/components/table-songs-list/table-songs-context'
import { Subscribe } from '@tanstack/react-table'
import { Show } from '@/components/utility/show'
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
      headerVariant='muted'
      className={className}
    >
      <TableRow
        rowVariant='header'
        padding='table'
        className={cn('h-10 gap-3', rowClassName)}
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
      <span className='sr-only'>{label ?? t('library.columns.cover')}</span>
    </TableHead>
  )
}

export function TableSongsHeaderTitle({
  title,
  countLabel,
  className,
}: {
  title?: string
  countLabel?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <TableHead className={cn(TABLE_SONGS_SLOTS.titleHead, className)}>
      <span className='truncate'>{title ?? t('library.columns.title')}</span>
      <Show when={Boolean(countLabel)}>
        <span className='ml-1 text-xs text-muted-foreground font-normal shrink-0'>
          ({countLabel})
        </span>
      </Show>
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
      <span className='truncate'>{label ?? t('library.columns.artist')}</span>
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
      <span className='truncate'>{label ?? t('library.columns.album')}</span>
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
      <span className='truncate'>{label ?? t('library.columns.duration')}</span>
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
