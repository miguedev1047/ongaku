import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import {
  MoreHorizontalSquare01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlaylistMenuGroup } from '@/features/youtube-search/components'
import { CopySongMenuItem } from '@/blocks/song-actions/shared'
import { useSearchSongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'

export interface SearchSongActionsProps {
  item: TYoutubeSearchResult
  className?: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  showLabel?: boolean
}

export function SearchSongActions({
  item,
  className,
  size = 'icon',
  variant = 'outline',
  showLabel = false,
}: SearchSongActionsProps) {
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = useSearchSongActions({ item })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={size}
            variant={variant}
            onClick={(e) => e.stopPropagation()}
            aria-label='Song actions'
            className={cn(className)}
          >
            <HugeiconsIcon icon={MoreHorizontalSquare01Icon} />
            <Show when={showLabel}>
              <span>Actions</span>
            </Show>
          </Button>
        }
      />
      <DropdownMenuContent
        align='end'
        className='w-48'
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={togglePlayback}
            className='cursor-pointer'
            disabled={isLoading}
          >
            <Show
              when={isPlaying}
              fallback={
                <>
                  <HugeiconsIcon icon={PlayIcon} />
                  <span>Play</span>
                </>
              }
            >
              <HugeiconsIcon icon={PauseIcon} />
              <span>Pause</span>
            </Show>
          </DropdownMenuItem>

          <CopySongMenuItem title={item.title} />

          <DropdownMenuItem
            onClick={handleOpenYoutube}
            className='cursor-pointer'
          >
            <HugeiconsIcon icon={YoutubeIcon} />
            <span>Open on YouTube</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='cursor-pointer'>
              <HugeiconsIcon icon={Music01Icon} />
              <span>Download on</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='w-48'>
              <Suspense
                fallback={
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Playlists</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='p-3 flex items-center justify-center'>
                      <Spinner className='size-4' />
                    </div>
                  </DropdownMenuGroup>
                }
              >
                <PlaylistMenuGroup onSelectPlaylist={handleSelectPlaylist} />
              </Suspense>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
