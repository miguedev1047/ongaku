import React, { Suspense, useState } from 'react'
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
import type { TYoutubeSearchResult } from '@/features/youtube-search/types'
import {
  Copy01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlaylistContextMenuGroup } from '@/features/download-queue/components'
import { useCopySongTitle } from '@/shared/components/song-actions/use-copy-song-title'
import { useSearchSongActions } from '@/features/youtube-search/components/song-actions/hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { CONTEXT_ACTIONS_MENU_WIDTH } from '@/constants/styles'
import { useTranslation } from 'react-i18next'

export interface SearchSongContextMenuProps {
  item: TYoutubeSearchResult
  children: React.ReactNode
  actions?: ReturnType<typeof useSearchSongActions>
}

export function SearchSongContextMenu(props: SearchSongContextMenuProps) {
  if (props.actions) {
    return <SearchSongContextMenuControlled {...props} actions={props.actions} />
  }
  return <SearchSongContextMenuStandalone {...props} />
}

function SearchSongContextMenuControlled({
  item,
  children,
  actions,
}: SearchSongContextMenuProps & { actions: ReturnType<typeof useSearchSongActions> }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = actions

  const { copySongTitle } = useCopySongTitle()

  return (
    <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenuTrigger render={children as React.ReactElement} />
      <Show when={isOpen}>
        <ContextMenuContent className={cn(CONTEXT_ACTIONS_MENU_WIDTH)}>
          <ContextMenuGroup>
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
                    <span>{t('player.play')}</span>
                  </>
                }
              >
                <HugeiconsIcon icon={PauseIcon} />
                <span>{t('player.pause')}</span>
              </Show>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => copySongTitle(item.title)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Copy01Icon} />
              <span>{t('playlists.actions.copy_title')}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleOpenYoutube}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={YoutubeIcon} />
              <span>{t('youtube_search.actions.open_youtube')}</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuSub>
              <ContextMenuSubTrigger className='cursor-pointer'>
                <HugeiconsIcon icon={Music01Icon} />
                <span>{t('youtube_search.actions.download_on')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className='w-48'>
                <Suspense
                  fallback={
                    <ContextMenuGroup>
                      <ContextMenuLabel>{t('playlists.header.title')}</ContextMenuLabel>
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
      </Show>
    </ContextMenu>
  )
}

function SearchSongContextMenuStandalone({
  item,
  children,
}: SearchSongContextMenuProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const actions = useSearchSongActions({ item })
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = actions

  const { copySongTitle } = useCopySongTitle()

  return (
    <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenuTrigger render={children as React.ReactElement} />
      <Show when={isOpen}>
        <ContextMenuContent className={cn(CONTEXT_ACTIONS_MENU_WIDTH)}>
          <ContextMenuGroup>
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
                    <span>{t('player.play')}</span>
                  </>
                }
              >
                <HugeiconsIcon icon={PauseIcon} />
                <span>{t('player.pause')}</span>
              </Show>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => copySongTitle(item.title)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Copy01Icon} />
              <span>{t('playlists.actions.copy_title')}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleOpenYoutube}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={YoutubeIcon} />
              <span>{t('youtube_search.actions.open_youtube')}</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuSub>
              <ContextMenuSubTrigger className='cursor-pointer'>
                <HugeiconsIcon icon={Music01Icon} />
                <span>{t('youtube_search.actions.download_on')}</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className='w-48'>
                <Suspense
                  fallback={
                    <ContextMenuGroup>
                      <ContextMenuLabel>{t('playlists.header.title')}</ContextMenuLabel>
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
      </Show>
    </ContextMenu>
  )
}
