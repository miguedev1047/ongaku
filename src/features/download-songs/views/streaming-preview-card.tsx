import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { DotmSquare10, DotmSquare18 } from '@/components/generic/loaders'
import { useStreamingPlayerStore } from '@/shared/stores/player'
import { formatDuration } from '@/shared/helpers/format-duration'
import { SearchSongActions } from '@/components/blocks/song-actions/search-songs'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'

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
          <Card
            size='sm'
            className={cn(
              'relative overflow-hidden bg-card/60',
              'animate-in fade-in slide-in-from-top-2 duration-200 p-0',
              className,
            )}
          >
            <div className='flex items-center justify-between gap-3 px-3 py-2.5'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <div
                  className='shrink-0 flex items-center justify-center size-9 rounded-md bg-primary/10 border border-primary/20 text-primary'
                  title={
                    isLoading
                      ? t('download_songs.preview.loading')
                      : t('download_songs.preview.streaming')
                  }
                >
                  <Show
                    when={isLoading}
                    fallback={
                      <DotmSquare18
                        size={22}
                        dotSize={3}
                        speed={1.35}
                        animated={isPlaying}
                        className='text-primary'
                      />
                    }
                  >
                    <DotmSquare10
                      size={22}
                      dotSize={3}
                      speed={1.2}
                      className='text-primary'
                    />
                  </Show>
                </div>

                <div className='relative shrink-0 size-9 rounded-md overflow-hidden bg-muted border border-border/40'>
                  <Show
                    when={thumbnailSrc}
                    fallback={
                      <div className='size-full flex items-center justify-center bg-accent text-muted-foreground'>
                        <HugeiconsIcon
                          icon={Music01Icon}
                          className='size-4'
                        />
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
                            <Badge
                              variant='secondary'
                              className='text-[10px] h-4.5 px-1.5 py-0 font-medium'
                            >
                              {t('download_songs.preview.paused')}
                            </Badge>
                          }
                        >
                          <Badge
                            variant='default'
                            className='text-[10px] h-4.5 px-1.5 py-0 font-medium bg-primary/90 text-primary-foreground'
                          >
                            {t('download_songs.preview.streaming')}
                          </Badge>
                        </Show>
                      }
                    >
                      <Badge
                        variant='outline'
                        className='text-[10px] h-4.5 px-1.5 py-0 font-medium border-primary/40 text-primary bg-primary/5'
                      >
                        {t('download_songs.preview.loading')}
                      </Badge>
                    </Show>
                  </div>

                  <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
                    <span className='truncate max-w-50 sm:max-w-xs'>
                      {track.channel}
                    </span>
                    <Show when={track.duration}>
                      {(trackDuration) => (
                        <>
                          <span>•</span>
                          <span className='font-mono text-[10px]'>
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
                        <HugeiconsIcon
                          icon={PlayIcon}
                          className='size-3.5'
                        />
                        <span>{t('player.play')}</span>
                      </>
                    }
                  >
                    <HugeiconsIcon
                      icon={PauseIcon}
                      className='size-3.5'
                    />
                    <span>{t('player.pause')}</span>
                  </Show>
                </Button>

                <SearchSongActions
                  item={track}
                  size='sm'
                  variant='ghost'
                />

                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  onClick={stop}
                  title={t('download_songs.preview.stop')}
                  aria-label={t('download_songs.preview.stop')}
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className='size-3.5'
                  />
                </Button>
              </div>
            </div>
          </Card>
        )
      }}
    </Show>
  )
}
