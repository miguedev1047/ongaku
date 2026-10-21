import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { AppWallpaperCard } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpaper-card'
import { getBackgroundUrl } from '@/lib/song-utils'
import type { TBackgroundItem } from '@/features/settings/queries/backgrounds'
import { useTranslation } from 'react-i18next'
import { RadioGroup } from '@/components/ui/radio-group'

export interface AppWallpapersListProps {
  wallpapers: TBackgroundItem[]
  currentWallpaper: string
  serverPort?: number
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function AppWallpapersList({
  wallpapers,
  currentWallpaper,
  serverPort,
  onSelect,
  onDelete,
}: AppWallpapersListProps) {
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(16)

  const visibleWallpapers = wallpapers.slice(0, visibleCount)
  const remainingCount = Math.max(0, wallpapers.length - visibleCount)
  const hasMore = remainingCount > 0

  return (
    <div className='space-y-2'>
      <div>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.app_background.list_title',
          )}
        </h3>
        <p className='text-3xs text-muted-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.app_background.list_description',
          )}
        </p>
      </div>

      <RadioGroup
        value={currentWallpaper ?? ''}
        onValueChange={(val) => onSelect(val as string)}
        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5'
      >
        <AppWallpaperCard isDefault value='' />

        {visibleWallpapers.map((bg) => {
          const imageUrl = serverPort
            ? getBackgroundUrl({ id: bg.id, port: serverPort, thumb: true })
            : ''

          return (
            <AppWallpaperCard
              key={bg.id}
              wallpaper={bg}
              imageUrl={imageUrl}
              value={bg.id}
              onDelete={() => onDelete(bg.id)}
            />
          )
        })}
      </RadioGroup>

      <Show when={hasMore}>
        <div className='flex items-center justify-center pt-1'>
          <Button
            type='button'
            variant='outline'
            size='default'
            onClick={() => setVisibleCount((prev) => prev + 16)}
          >
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.show_more',
              { count: remainingCount },
            )}
          </Button>
        </div>
      </Show>
    </div>
  )
}
