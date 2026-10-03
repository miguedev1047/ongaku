import { useState } from 'react'
import { useStreamingPlayerStore } from '@/shared/stores/player'
import {
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { formatDuration } from '@/shared/helpers/format-duration'
import { Show } from '@/components/utility/show'
import { YoutubeSongActions } from '@/features/youtube-search/components'
import { cn } from 'cn'
import { DotmSquare1, DotmSquare18 } from '@/components/loaders'

interface YoutubeSongInfoProps {
  className?: string
}

export function YoutubeSongInfo({ className }: YoutubeSongInfoProps) {
  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const isPlaying = useStreamingPlayerStore(
    (state) => state.playerState === 'playing',
  )
  const isLoading = useStreamingPlayerStore(
    (state) => state.playerState === 'loading',
  )
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const [imageError, setImageError] = useState(false)

  if (!currentTrack) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-6 border border-dashed h-full',
          className,
        )}
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <HugeiconsIcon icon={Music01Icon} />
            </EmptyMedia>
            <EmptyTitle>No active track</EmptyTitle>
            <EmptyDescription>
              Select any song from search to view details and stream.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const thumbnailSrc =
    !imageError && currentTrack.thumbnail ? currentTrack.thumbnail : null
  const playButtonVariant = isPlaying ? 'default' : 'outline'
  const playButtonLabel = isPlaying ? 'Pause' : 'Play'
  const playButtonIcon = isPlaying ? PauseIcon : PlayIcon

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-4 border bg-card/60 backdrop-blur-sm shadow-sm h-full',
        className,
      )}
    >
      <div className='relative aspect-video rounded-lg overflow-hidden bg-muted border border-border/50 shadow-sm shrink-0'>
        <Show
          when={thumbnailSrc}
          fallback={
            <div className='size-full flex items-center justify-center bg-accent'>
              <HugeiconsIcon
                icon={Music01Icon}
                className='size-8 text-muted-foreground'
              />
            </div>
          }
        >
          {(src) => (
            <img
              src={src}
              alt={currentTrack.title}
              className='size-full object-cover'
              onError={() => setImageError(true)}
            />
          )}
        </Show>

        <div className='absolute top-2 left-2 flex items-center gap-1.5'>
          <Badge
            variant='destructive'
            className='text-[10px] px-1.5 py-0.5 bg-red-600/90 text-white flex items-center gap-1 shadow'
          >
            <HugeiconsIcon
              icon={YoutubeIcon}
              className='size-2.5'
            />
            <span>Stream</span>
          </Badge>

          <Show when={isPlaying}>
            <Badge
              variant='outline'
              className={cn(
                'text-[10px] px-1.5 py-0.5 border-primary/60 text-primary bg-background/80 backdrop-blur-xs flex items-center gap-1.5 shadow',
              )}
            >
              <DotmSquare18
                size={12}
                dotSize={1.8}
                speed={1.5}
                className='text-primary'
              />
              <span>Playing</span>
            </Badge>
          </Show>
        </div>

        <Show when={currentTrack.duration}>
          {(duration) => (
            <span className='absolute bottom-2 right-2 text-[10px] bg-black/80 text-white font-mono px-1.5 py-0.5 rounded leading-none shadow'>
              {formatDuration(duration)}
            </span>
          )}
        </Show>
      </div>

      {/* Song Details */}
      <div className='flex flex-col gap-1 min-w-0'>
        <h2
          className='text-sm md:text-base font-semibold line-clamp-2 leading-snug'
          title={currentTrack.title}
        >
          {currentTrack.title}
        </h2>
        <p
          className='text-xs text-muted-foreground line-clamp-1'
          title={currentTrack.channel}
        >
          {currentTrack.channel}
        </p>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center gap-2 pt-2 border-t border-border/50'>
        <Button
          size='sm'
          variant={playButtonVariant}
          onClick={togglePlay}
          className='flex-1 gap-1.5'
          disabled={isLoading}
        >
          <HugeiconsIcon
            icon={playButtonIcon}
            className='size-3.5'
          />
          <span>{playButtonLabel}</span>
        </Button>

        <YoutubeSongActions item={currentTrack} />
      </div>

      {/* Interactive Status Footer */}
      <div className='mt-auto pt-2 space-y-2'>
        <Show when={isLoading}>
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-md border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-200',
            )}
          >
            <div className='shrink-0 flex items-center justify-center size-7 rounded-sm bg-primary/10 text-primary'>
              <DotmSquare1
                size={20}
                dotSize={3}
                speed={1.2}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='font-medium text-foreground text-xs leading-none truncate'>
                Loading audio stream
              </span>
              <span className='text-[10px] text-muted-foreground mt-1 leading-none truncate'>
                Fetching YouTube audio source...
              </span>
            </div>
          </div>
        </Show>

        <Show when={isPlaying}>
          <div
            className={cn(
              'flex items-center gap-3 p-2.5 rounded-md border border-border/40 bg-muted/30 animate-in fade-in slide-in-from-bottom-2 duration-200',
            )}
          >
            <div className='shrink-0 flex items-center justify-center size-7 rounded-sm bg-primary/10 text-primary'>
              <DotmSquare18
                size={20}
                dotSize={3}
                speed={1.4}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='font-medium text-foreground text-xs leading-none truncate'>
                Now Streaming
              </span>
              <span className='text-[10px] text-muted-foreground mt-1 leading-none truncate'>
                Live audio playback active
              </span>
            </div>
          </div>
        </Show>
      </div>
    </Card>
  )
}
