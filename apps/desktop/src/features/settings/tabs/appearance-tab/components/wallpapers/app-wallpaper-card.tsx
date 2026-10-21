import { Button } from '@ongaku/ui'
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
} from '@ongaku/ui'
import { FieldContent, FieldLabel } from '@ongaku/ui'
import { RadioGroupItem } from '@ongaku/ui'
import { Show } from '@ongaku/ui'
import type { TBackgroundItem } from '@/features/settings/queries/backgrounds'
import { Delete02Icon, ImageNotFound01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export interface AppWallpaperCardProps {
  wallpaper?: TBackgroundItem
  isDefault?: boolean
  imageUrl?: string
  value: string
  onDelete?: () => void
}

export function AppWallpaperCard({
  wallpaper,
  isDefault = false,
  imageUrl,
  value,
  onDelete,
}: AppWallpaperCardProps) {
  const { t } = useTranslation()
  const inputId = isDefault ? 'wallpaper-default' : `wallpaper-${value}`

  return (
    <div
      className={cn(
        'group relative h-35 rounded-md border border-border/60 overflow-hidden bg-muted/20 hover:border-border transition-colors has-data-checked:border-primary has-data-checked:ring-1 has-data-checked:ring-primary/40',
      )}
    >
      <FieldLabel
        htmlFor={inputId}
        className={cn('size-full cursor-pointer block')}
      >
        <Show
          when={!isDefault}
          fallback={
            <Empty
              className={cn('size-full border-dashed justify-center relative')}
            >
              <EmptyContent>
                <EmptyMedia>
                  <HugeiconsIcon icon={ImageNotFound01Icon} />
                </EmptyMedia>
                <EmptyTitle>
                  {t(
                    'settings.tabs.appearance.appearance_and_interface.app_background.default',
                  )}
                </EmptyTitle>
              </EmptyContent>
              <RadioGroupItem
                value=''
                id='wallpaper-default'
                className={cn('absolute bottom-2 right-2 z-10')}
              />
            </Empty>
          }
        >
          <FieldContent className={cn('size-full relative')}>
            <Show when={Boolean(imageUrl)}>
              <img
                src={imageUrl}
                alt={wallpaper?.file_name}
                className={cn('size-full object-cover')}
              />
            </Show>

            <RadioGroupItem
              value={value}
              id={inputId}
              className={cn('absolute bottom-2 right-2 z-10')}
            />
          </FieldContent>
        </Show>
      </FieldLabel>

      <Show when={Boolean(onDelete)}>
        <Button
          type='button'
          size='icon'
          variant='destructive-solid'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete?.()
          }}
          className={cn(
            'absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
          )}
          aria-label={t(
            'settings.tabs.appearance.appearance_and_interface.app_background.delete',
          )}
        >
          <HugeiconsIcon icon={Delete02Icon} />
        </Button>
      </Show>
    </div>
  )
}
