import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { AppWallpaperCard } from '@/features/settings/components/app-wallpaper-card'
import { getBackgroundUrl } from '@/lib/song-utils'
import type { TBackgroundItem } from '@/shared/queries/backgrounds'
import { useTranslation } from 'react-i18next'

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
    <>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1'>
        <AppWallpaperCard
          isDefault
          isSelected={!currentWallpaper}
          onSelect={() => onSelect('')}
        />

        {visibleWallpapers.map((bg) => {
          const isChecked = currentWallpaper === bg.id
          const imageUrl = serverPort
            ? getBackgroundUrl({ id: bg.id, port: serverPort, thumb: true })
            : ''

          return (
            <AppWallpaperCard
              key={bg.id}
              wallpaper={bg}
              isSelected={isChecked}
              imageUrl={imageUrl}
              onSelect={() => onSelect(bg.id)}
              onDelete={(e) => {
                e.stopPropagation()
                onDelete(bg.id)
              }}
            />
          )
        })}
      </div>

      <Show when={hasMore}>
        <div className='flex items-center justify-center pt-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setVisibleCount((prev) => prev + 16)}
            className='h-7 text-xs px-3 rounded-md border-border/60 hover:bg-accent/60'
          >
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.show_more',
              { count: remainingCount },
            )}
          </Button>
        </div>
      </Show>
    </>
  )
}
