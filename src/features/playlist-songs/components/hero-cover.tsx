import { CoverImage } from '@/components/cover-image'
import { DotmSquare18 } from '@/components/loaders/dotm-square-18'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'

export interface PlaylistHeroCoverProps {
  coverUrl?: string
  coverAlt: string
  playlistName: string
  tracksCount: number
  trackLabel: string
  durationText: string
  hasShowCover: boolean
  isPlaylistPlaying: boolean
  currentSong: TPlaylistSong | null
}

export function PlaylistHeroCover({
  coverUrl,
  coverAlt,
  playlistName,
  tracksCount,
  trackLabel,
  durationText,
  hasShowCover,
  isPlaylistPlaying,
  currentSong,
}: PlaylistHeroCoverProps) {
  return (
    <div
      className={cn(
        'flex items-center sm:items-end gap-3.5 sm:gap-5 min-w-0 flex-1',
      )}
    >
      <Show when={hasShowCover && coverUrl}>
        <figure
          className={cn(
            'size-24 sm:size-32 md:size-36 lg:size-40 shrink-0 overflow-hidden rounded-lg shadow-md border border-border/20',
          )}
        >
          <CoverImage
            src={coverUrl}
            alt={coverAlt}
            className={cn('size-full object-cover')}
          />
        </figure>
      </Show>

      <div className={cn('space-y-1.5 sm:space-y-2 min-w-0 flex-1')}>
        <span
          className={cn(
            'text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground',
          )}
        >
          Playlist
        </span>
        <h1
          className={cn(
            'text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight truncate',
          )}
          title={playlistName}
        >
          {playlistName}
        </h1>
        <div
          className={cn(
            'flex items-center gap-2 text-xs sm:text-sm text-muted-foreground',
          )}
        >
          <p>
            {tracksCount} {trackLabel}
          </p>
          <p>•</p>
          <p>{durationText}</p>
        </div>

        <Show when={isPlaylistPlaying && currentSong}>
          {(song) => (
            <div
              className={cn(
                'inline-flex items-center gap-2 p-2 rounded-md border border-border/40 bg-background/60 backdrop-blur-xs max-w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-2xs mt-1',
              )}
            >
              <div
                className={cn(
                  'shrink-0 flex items-center justify-center size-5 rounded-sm bg-primary/10 text-primary',
                )}
              >
                <DotmSquare18
                  size={14}
                  dotSize={2.5}
                  speed={1.4}
                />
              </div>
              <div className={cn('flex items-center gap-1.5 min-w-0 text-xs')}>
                <span
                  className={cn(
                    'font-semibold text-foreground shrink-0 text-[11px]',
                  )}
                >
                  Now playing:
                </span>
                <span
                  className={cn('text-[11px] text-muted-foreground truncate')}
                  title={song.name}
                >
                  {song.name}
                </span>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
