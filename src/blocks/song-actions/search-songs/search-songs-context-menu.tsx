import React, { Suspense } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Spinner } from '@/components/ui/spinner'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import {
  Copy01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlaylistContextMenuGroup } from '@/features/youtube-search/components'
import { useCopySongTitle } from '@/blocks/song-actions/shared/use-copy-song-title'
import { useSearchSongActions } from '@/blocks/song-actions/search-songs/hooks'
import { Show } from '@/components/utility/show'

export interface SearchSongContextMenuProps {
  item: TYoutubeSearchResult
  children: React.ReactNode
}

export function SearchSongContextMenu({
  item,
  children,
}: SearchSongContextMenuProps) {
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = useSearchSongActions({ item })

  const { copySongTitle } = useCopySongTitle()

  return (
    <ContextMenu>
      <ContextMenuTrigger render={children as React.ReactElement} />
      <ContextMenuContent className='w-48'>
        <ContextMenuGroup>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuSeparator />

          <ContextMenuItem
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
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => copySongTitle(item.title)}
            className='cursor-pointer'
          >
            <HugeiconsIcon icon={Copy01Icon} />
            <span>Copy title</span>
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handleOpenYoutube}
            className='cursor-pointer'
          >
            <HugeiconsIcon icon={YoutubeIcon} />
            <span>Open on YouTube</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger className='cursor-pointer'>
              <HugeiconsIcon icon={Music01Icon} />
              <span>Download on</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className='w-48'>
              <Suspense
                fallback={
                  <ContextMenuGroup>
                    <ContextMenuLabel>Playlists</ContextMenuLabel>
                    <ContextMenuSeparator />
                    <div className='p-3 flex items-center justify-center'>
                      <Spinner className='size-4' />
                    </div>
                  </ContextMenuGroup>
                }
              >
                <PlaylistContextMenuGroup
                  onSelectPlaylist={handleSelectPlaylist}
                />
              </Suspense>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
