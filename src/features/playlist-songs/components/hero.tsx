import { FolderIcon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { CoverImage } from '@/components/cover-image'
import { Show } from '@/components/utility/show'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlaylistHero } from '@/features/playlist-songs/hooks/use-playlist-hero'
import { DotmSquare18 } from '@/components/ui/dotm-square-18'

export function PlaylistSongHero() {
  const {
    playlistName,
    songs,
    isLoading,
    isError,
    coverUrl,
    coverAlt,
    currentSong,
    tracksCount,
    trackLabel,
    durationText,
    bgCardColor,
    hasShowCover,
    isPlaylistPlaying,
    playTooltipText,
    handleOpenFolder,
    handlePlayPlaylist,
  } = usePlaylistHero()

  if (!songs) return null
  if (isLoading || isError) return null

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 px-4 sm:px-6 pt-4 sm:pt-6',
      )}
    >
      <div
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 w-full bg-card p-4 sm:p-5 rounded-lg border border-border/40 transition-all ease-in-out duration-300 relative overflow-hidden',
        )}
        style={{ backgroundColor: bgCardColor }}
      >
        <div
          className={cn(
            'flex items-center sm:items-end gap-3.5 sm:gap-5 min-w-0 flex-1',
          )}
        >
          <Show when={hasShowCover}>
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
                  <div
                    className={cn('flex items-center gap-1.5 min-w-0 text-xs')}
                  >
                    <span
                      className={cn(
                        'font-semibold text-foreground shrink-0 text-[11px]',
                      )}
                    >
                      Now playing:
                    </span>
                    <span
                      className={cn(
                        'text-[11px] text-muted-foreground truncate',
                      )}
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

        <div
          className={cn(
            'flex flex-row sm:flex-col justify-between sm:justify-between items-center sm:items-end w-full sm:w-auto shrink-0 sm:self-stretch gap-3 pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0',
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleOpenFolder}
                  className={cn(
                    'gap-1.5 text-xs bg-background/60 hover:bg-background/90 backdrop-blur-xs cursor-pointer',
                  )}
                >
                  <HugeiconsIcon
                    icon={FolderIcon}
                    className={cn('size-3.5')}
                  />
                  <span>Open folder</span>
                </Button>
              }
            />
            <TooltipContent side='top'>
              <p>Open playlist folder in file explorer</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size='icon-lg'
                  variant='default'
                  onClick={handlePlayPlaylist}
                  disabled={tracksCount === 0}
                  aria-label={
                    isPlaylistPlaying ? 'Pause playlist' : 'Play playlist'
                  }
                  className={cn(
                    'size-10 sm:size-12 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0',
                    isPlaylistPlaying && 'bg-primary text-primary-foreground',
                  )}
                >
                  <Show
                    when={isPlaylistPlaying}
                    fallback={
                      <HugeiconsIcon
                        icon={PlayIcon}
                        className={cn('size-5 sm:size-6 ml-0.5 fill-current')}
                      />
                    }
                  >
                    <HugeiconsIcon
                      icon={PauseIcon}
                      className={cn('size-5 sm:size-6 fill-current')}
                    />
                  </Show>
                </Button>
              }
            />
            <TooltipContent side='top'>
              <p>{playTooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
