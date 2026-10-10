import { Badge } from '@/components/ui/badge'
import { Show } from '@/components/utility/show'
import type { TBackgroundItem } from '@/shared/queries/backgrounds'
import {
  Delete02Icon,
  ImageNotFound01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export interface AppWallpaperCardProps {
  wallpaper?: TBackgroundItem
  isDefault?: boolean
  isSelected: boolean
  imageUrl?: string
  onSelect: () => void
  onDelete?: (e: React.MouseEvent) => void
}

export function AppWallpaperCard({
  wallpaper,
  isDefault = false,
  isSelected,
  imageUrl,
  onSelect,
  onDelete,
}: AppWallpaperCardProps) {
  const { t } = useTranslation()

  return (
    <div
      onClick={onSelect}
      role='button'
      tabIndex={0}
      className={cn(
        'group relative h-36 rounded-md border bg-muted/20 cursor-pointer transition-all select-none',
        isDefault
          ? 'flex flex-col items-center justify-center p-3'
          : 'overflow-hidden',
        isSelected
          ? 'border-transparent ring-2 outline-2 ring-foreground outline-foreground'
          : 'border-black/10 dark:border-white/10 hover:opacity-85 hover:scale-102',
      )}
    >
      <Show
        when={!isDefault}
        fallback={
          <>
            <HugeiconsIcon
              icon={ImageNotFound01Icon}
              className='size-6 text-muted-foreground mb-1'
            />
            <span className='text-xs font-medium text-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.default',
              )}
            </span>
          </>
        }
      >
        <Show when={Boolean(imageUrl)}>
          <img
            src={imageUrl}
            alt={wallpaper?.file_name ?? 'Wallpaper'}
            className='absolute inset-0 size-full object-cover'
            loading='lazy'
            decoding='async'
          />
        </Show>

        <div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none' />

        <Show when={Boolean(onDelete)}>
          <button
            type='button'
            aria-label={t(
              'settings.tabs.appearance.appearance_and_interface.app_background.delete',
            )}
            onClick={onDelete}
            className='absolute top-1.5 right-1.5 size-6 rounded-md bg-black/60 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              className='size-3.5'
            />
          </button>
        </Show>
      </Show>

      <Show when={isSelected}>
        <Badge
          variant='default'
          size='sm'
          className='absolute bottom-1.5 left-1.5'
        >
          <HugeiconsIcon
            icon={Tick02Icon}
            className='size-2.5 mr-0.5'
          />
          {t(
            'settings.tabs.appearance.appearance_and_interface.app_background.active',
          )}
        </Badge>
      </Show>
    </div>
  )
}
