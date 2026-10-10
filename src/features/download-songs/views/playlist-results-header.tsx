import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { Cancel01Icon, ListMusicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

interface PlaylistResultsHeaderProps {
  count: number
  onClear: () => void
}

export function PlaylistResultsHeader({
  count,
  onClear,
}: PlaylistResultsHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex items-center justify-between pb-2 border-b border-border/30 w-full'>
      <div className='flex items-center gap-2'>
        <HugeiconsIcon
          icon={ListMusicIcon}
          className='size-4 text-primary'
        />
        <span className='text-xs font-semibold text-foreground'>
          <Show
            when={count === 1}
            fallback={t('download_songs.results.playlist_count_plural', {
              count,
            })}
          >
            {t('download_songs.results.playlist_count', { count })}
          </Show>
        </span>
      </div>

      <Button
        type='button'
        variant='ghost-muted'
        size='sm'
        onClick={onClear}
        className='gap-1.5'
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          className='size-3.5'
        />
        {t('download_songs.results.clear_results')}
      </Button>
    </div>
  )
}
