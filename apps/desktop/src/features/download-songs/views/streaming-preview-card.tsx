import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@ongaku/ui'
import { Button } from '@ongaku/ui'
import { Show } from '@ongaku/ui'
import { cn } from 'cn'
import { useStreamingPlayerStore } from '@/features/player/stores'
import { formatDuration } from '@/shared/helpers/format-duration'
import { SearchSongActions } from '@/features/youtube-search/components/song-actions'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Music01Icon,
  Music3Icon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { CardWrapper } from '@ongaku/ui'
import { Spinner } from '@ongaku/ui'

export interface StreamingPreviewCardProps {
  className?: string
}

export function StreamingPreviewCard({ className }: StreamingPreviewCardProps) {
  const { t } = useTranslation()
  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const playerState = useStreamingPlayerStore((state) => state.playerState)
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const stop = useStreamingPlayerStore((state) => state.stop)

  const [imageError, setImageError] = useState(false)
  const [prevTrackId, setPrevTrackId] = useState(currentTrack?.id)

  if (currentTrack?.id !== prevTrackId) {
    setPrevTrackId(currentTrack?.id)
    setImageError(false)
  }

  const isLoading = playerState === 'loading'
  const isPlaying = playerState === 'playing'

  return (
    <Show when={currentTrack}>
      {(track) => {
        const thumbnailSrc =
          !imageError && track.thumbnail ? track.thumbnail : null

        return (
          <CardWrapper
            padding='none'
            animated={true}
            className={cn('relative overflow-hidden', className)}
          >
            <div className='flex items-center justify-between gap-3 px-3 py-2.5'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <div
                  className='shrink-0 flex items-center justify-center size-7 rounded-md bg-primary/10 border border-primary/20 text-primary'
                  title={
                    isLoading
                      ? t('download_songs.preview.loading')
                      : t('download_songs.preview.streaming')
                  }
                >
                  <Show
                    when={isLoading}
                    fallback={
                      <HugeiconsIcon icon={Music3Icon} className='size-4' />
                    }
                  >
                    <Spinner />
                  </Show>
                </div>

                <div className='relative shrink-0 size-9 rounded-md overflow-hidden bg-muted border border-border/40'>
                  <Show
                    when={thumbnailSrc}
                    fallback={
                      <div className='size-full flex items-center justify-center bg-accent text-muted-foreground'>
                        <HugeiconsIcon icon={Music01Icon} className='size-4' />
                      </div>
                    }
                  >
                    {(src) => (
                      <img
                        src={src}
                        alt={track.title}
                        className='size-full object-cover'
                        onError={() => setImageError(true)}
                      />
                    )}
                  </Show>
                </div>

                <div className='flex flex-col min-w-0 flex-1'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span
                      className='text-xs font-semibold text-foreground truncate max-w-sm md:max-w-md'
                      title={track.title}
                    >
                      {track.title}
                    </span>

                    <Show
                      when={isLoading}
                      fallback={
                        <Show
                          when={isPlaying}
                          fallback={
                            <Badge variant='secondary' size='sm'>
                              {t('download_songs.preview.paused')}
                            </Badge>
                          }
                        >
                          <Badge variant='default' size='sm'>
                            {t('download_songs.preview.streaming')}
                          </Badge>
                        </Show>
                      }
                    >
                      <Badge variant='outline-primary' size='sm'>
                        {t('download_songs.preview.loading')}
                      </Badge>
                    </Show>
                  </div>

                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='truncate max-w-50 sm:max-w-xs'>
                      {track.channel}
                    </span>
                    <Show when={track.duration}>
                      {(trackDuration) => (
                        <>
                          <span>•</span>
                          <span className='font-mono text-2xs'>
                            {formatDuration(trackDuration)}
                          </span>
                        </>
                      )}
                    </Show>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1.5 shrink-0'>
                <Button
                  type='button'
                  variant={isPlaying ? 'default' : 'outline'}
                  size='sm'
                  disabled={isLoading}
                  onClick={togglePlay}
                  aria-label={isPlaying ? t('player.pause') : t('player.play')}
                >
                  <Show
                    when={isPlaying}
                    fallback={
                      <>
                        <HugeiconsIcon icon={PlayIcon} className='size-3.5' />
                        <span>{t('player.play')}</span>
                      </>
                    }
                  >
                    <HugeiconsIcon icon={PauseIcon} className='size-3.5' />
                    <span>{t('player.pause')}</span>
                  </Show>
                </Button>

                <SearchSongActions item={track} size='sm' variant='ghost' />

                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={stop}
                  title={t('download_songs.preview.stop')}
                  aria-label={t('download_songs.preview.stop')}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className='size-3.5' />
                </Button>
              </div>
            </div>
          </CardWrapper>
        )
      }}
    </Show>
  )
}
