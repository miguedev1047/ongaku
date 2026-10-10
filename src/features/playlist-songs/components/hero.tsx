import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlaylistHero } from '@/features/playlist-songs/hooks/use-playlist-hero'
import { PlaylistHeroActions } from '@/components/blocks/song-actions/playlists'
import { PlaylistHeroCover } from '@/features/playlist-songs/components/hero-cover'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from '@/components/ui/card-wrapper'

export function PlaylistSongHero() {
  const { t } = useTranslation()
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
      <CardWrapper
        variant='hero'
        padding='hero'
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-end justify-between w-full relative overflow-hidden',
        )}
        style={{ backgroundColor: bgCardColor }}
      >
        <PlaylistHeroCover
          coverUrl={coverUrl}
          coverAlt={coverAlt}
          playlistName={playlistName}
          tracksCount={tracksCount}
          trackLabel={trackLabel}
          durationText={durationText}
          hasShowCover={hasShowCover}
          isPlaylistPlaying={isPlaylistPlaying}
          currentSong={currentSong}
        />

        <div
          className={cn(
            'flex flex-row sm:flex-col justify-between sm:justify-between items-center sm:items-end w-full sm:w-auto shrink-0 sm:self-stretch gap-3 pt-2 sm:pt-0 border-t border-border/20 sm:border-t-0',
          )}
        >
          <PlaylistHeroActions />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size='icon-lg'
                  variant='default'
                  onClick={handlePlayPlaylist}
                  disabled={tracksCount === 0}
                  aria-label={
                    isPlaylistPlaying
                      ? t('player.pause')
                      : t('playlists.actions.play')
                  }
                  className='size-10 sm:size-12 hover:scale-105 active:scale-95 cursor-pointer shrink-0'
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
      </CardWrapper>
    </div>
  )
}
