import { Subscribe } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { TableCell, TableRow } from '@/components/ui/table'
import { Show } from '@/components/utility/show'
import { CoverImage } from '@/components/generic/cover-image'
import { formatDuration } from '@/shared/helpers/format-duration'
import { TABLE_SONGS_SLOTS } from '@/components/compounds/table-songs-list/table-songs-constants'
import { MusicNote01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export type TableSongIcon = React.ComponentProps<typeof HugeiconsIcon>['icon']

export interface TableSongsItemProps extends React.ComponentProps<'div'> {
  isActive?: boolean
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
  className?: string
}

export function TableSongsItem({
  isActive = false,
  onClick,
  children,
  className,
  ...props
}: TableSongsItemProps) {
  return (
    <TableRow
      onClick={onClick}
      data-active-track={isActive}
      className={cn(
        'group w-full h-full px-3 gap-3 border-b border-border/20 cursor-pointer select-none',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </TableRow>
  )
}

export interface TableSongSelectableRow {
  id: string
  index: number
  toggleSelected: () => void
  table: {
    atoms: {
      rowSelection: any
    }
  }
}

export interface TableSongsItemSelectProps {
  row: TableSongSelectableRow | any
  label?: string
  className?: string
}

export function TableSongsItemSelect({
  row,
  label,
  className,
}: TableSongsItemSelectProps) {
  const { t } = useTranslation()

  return (
    <TableCell
      className={cn(TABLE_SONGS_SLOTS.select, className)}
      onClick={(e) => e.stopPropagation()}
      data-slot='item-actions'
    >
      <Subscribe
        source={row.table.atoms.rowSelection}
        selector={(selection: Record<string, boolean>) => {
          const isSelected = Boolean(selection?.[row.id])
          const hasSelection = Object.values(selection || {}).some(Boolean)
          return { isSelected, hasSelection }
        }}
      >
        {({ isSelected, hasSelection }) => (
          <Show
            when={hasSelection}
            fallback={
              <div className='size-full flex items-center justify-center'>
                <span className='text-xs font-mono text-muted-foreground/70 group-hover:hidden'>
                  {row.index + 1}
                </span>
                <Checkbox
                  className='hidden group-hover:flex'
                  checked={false}
                  onCheckedChange={() => row.toggleSelected()}
                  aria-label={t('playlists.batch.select_song', {
                    name: label ?? '',
                  })}
                />
              </div>
            }
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => row.toggleSelected()}
              aria-label={t('playlists.batch.select_song', {
                name: label ?? '',
              })}
            />
          </Show>
        )}
      </Subscribe>
    </TableCell>
  )
}

export interface TableSongsItemCoverProps {
  src?: string | null
  alt?: string
  className?: string
  containerClassName?: string
  fallbackIcon?: TableSongIcon
}

export function TableSongsItemCover({
  src,
  alt,
  className,
  containerClassName,
  fallbackIcon = MusicNote01Icon,
}: TableSongsItemCoverProps) {
  return (
    <TableCell className={cn(TABLE_SONGS_SLOTS.cover, className)}>
      <div
        className={cn(
          'size-9 rounded-md overflow-hidden bg-muted flex items-center justify-center',
          containerClassName,
        )}
      >
        <Show
          when={Boolean(src)}
          fallback={
            <HugeiconsIcon
              icon={fallbackIcon}
              className='size-4 text-muted-foreground'
            />
          }
        >
          <CoverImage
            src={src!}
            alt={alt ?? ''}
            className='size-full object-cover'
          />
        </Show>
      </div>
    </TableCell>
  )
}

export interface TableSongsItemTitleProps {
  title: string
  subtitle?: string | null
  className?: string
  titleClassName?: string
  subtitleClassName?: string
  children?: React.ReactNode
}

export function TableSongsItemTitle({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  children,
}: TableSongsItemTitleProps) {
  const isStacked = Boolean(subtitle)

  return (
    <TableCell
      className={cn(
        TABLE_SONGS_SLOTS.title,
        isStacked
          ? 'flex-col justify-center items-start'
          : 'items-center gap-2',
        className,
      )}
    >
      <span
        className={cn(
          'text-xs font-medium text-foreground truncate',
          isStacked && 'w-full',
          titleClassName,
        )}
      >
        {title}
      </span>
      <Show when={Boolean(subtitle)}>
        <span
          className={cn(
            'text-[11px] text-muted-foreground truncate w-full',
            subtitleClassName,
          )}
        >
          {subtitle}
        </span>
      </Show>
      {children}
    </TableCell>
  )
}

export interface TableSongsItemArtistProps {
  name?: string | null
  className?: string
}

export function TableSongsItemArtist({
  name,
  className,
}: TableSongsItemArtistProps) {
  return (
    <TableCell className={cn(TABLE_SONGS_SLOTS.artist, className)}>
      <span className='truncate w-full'>{name}</span>
    </TableCell>
  )
}

export interface TableSongsItemAlbumProps {
  name?: string | null
  className?: string
}

export function TableSongsItemAlbum({
  name,
  className,
}: TableSongsItemAlbumProps) {
  return (
    <TableCell className={cn(TABLE_SONGS_SLOTS.album, className)}>
      <span className='truncate w-full'>{name}</span>
    </TableCell>
  )
}

export interface TableSongsItemDurationProps {
  duration?: number
  text?: string
  className?: string
}

export function TableSongsItemDuration({
  duration,
  text,
  className,
}: TableSongsItemDurationProps) {
  const formatted =
    text ?? (duration !== undefined ? formatDuration(duration) : '--:--')

  return (
    <TableCell className={cn(TABLE_SONGS_SLOTS.duration, className)}>
      {formatted}
    </TableCell>
  )
}

export interface TableSongsItemActionsProps {
  className?: string
  children: React.ReactNode
}

export function TableSongsItemActions({
  className,
  children,
}: TableSongsItemActionsProps) {
  return (
    <TableCell
      className={cn(TABLE_SONGS_SLOTS.actions, className)}
      onClick={(e) => e.stopPropagation()}
      data-slot='item-actions'
    >
      {children}
    </TableCell>
  )
}

TableSongsItem.Select = TableSongsItemSelect
TableSongsItem.Cover = TableSongsItemCover
TableSongsItem.Title = TableSongsItemTitle
TableSongsItem.Artist = TableSongsItemArtist
TableSongsItem.Album = TableSongsItemAlbum
TableSongsItem.Duration = TableSongsItemDuration
TableSongsItem.Actions = TableSongsItemActions

export const TableSongItem = TableSongsItem
