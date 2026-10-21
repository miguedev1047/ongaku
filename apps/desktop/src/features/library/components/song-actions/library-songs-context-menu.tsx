import * as React from 'react'
import { useState } from 'react'
import type { TPlaylistSong } from '@/features/playlist-songs/types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@ongaku/ui'
import {
  Copy01Icon,
  Delete01Icon,
  FolderIcon,
  FolderTransferIcon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteSong, MoveSong } from '@/features/playlist-songs/components'
import { useCopySongTitle } from '@/shared/components/song-actions/use-copy-song-title'
import { useLibrarySongActions } from '@/features/library/components/song-actions/hooks'
import { Show } from '@ongaku/ui'
import { cn } from 'cn'
import { CONTEXT_ACTIONS_MENU_WIDTH } from '@ongaku/ui'
import { useTranslation } from 'react-i18next'

export interface LibrarySongContextMenuProps {
  song: TPlaylistSong
  children: React.ReactNode
  actions?: ReturnType<typeof useLibrarySongActions>
}

export function LibrarySongContextMenu(props: LibrarySongContextMenuProps) {
  if (props.actions) {
    return (
      <LibrarySongContextMenuControlled
        {...props}
        actions={props.actions}
      />
    )
  }
  return <LibrarySongContextMenuStandalone {...props} />
}

function LibrarySongContextMenuControlled({
  song,
  children,
  actions,
}: LibrarySongContextMenuProps & { actions: ReturnType<typeof useLibrarySongActions> }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const {
    isPlaying,
    setIsDeleteDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = actions

  const { copySongTitle } = useCopySongTitle()

  return (
    <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
      <ContextMenuTrigger render={children as React.ReactElement} />
      <Show when={isOpen}>
        <ContextMenuContent className={cn(CONTEXT_ACTIONS_MENU_WIDTH)}>
          <ContextMenuGroup>
            <ContextMenuItem
              onClick={handleTogglePlayback}
              className='cursor-pointer'
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
              onClick={() => copySongTitle(song.name)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Copy01Icon} />
              <span>{t('playlists.actions.copy_title')}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleOpenFolder}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderIcon} />
              <span>{t('playlists.actions.open_folder')}</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => setIsMoveDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderTransferIcon} />
              <span>{t('playlists.actions.move_to')}</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              variant='destructive'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t('playlists.actions.delete')}</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </Show>
    </ContextMenu>
  )
}

function LibrarySongContextMenuStandalone({
  song,
  children,
}: LibrarySongContextMenuProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const actions = useLibrarySongActions({ song })
  const {
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = actions

  const { copySongTitle } = useCopySongTitle()

  return (
    <>
      <ContextMenu open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenuTrigger render={children as React.ReactElement} />
        <Show when={isOpen}>
          <ContextMenuContent className={cn(CONTEXT_ACTIONS_MENU_WIDTH)}>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={handleTogglePlayback}
                className='cursor-pointer'
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
                onClick={() => copySongTitle(song.name)}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={Copy01Icon} />
                <span>{t('playlists.actions.copy_title')}</span>
              </ContextMenuItem>

              <ContextMenuItem
                onClick={handleOpenFolder}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={FolderIcon} />
                <span>{t('playlists.actions.open_folder')}</span>
              </ContextMenuItem>

              <ContextMenuItem
                onClick={() => setIsMoveDialogOpen(true)}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={FolderTransferIcon} />
                <span>{t('playlists.actions.move_to')}</span>
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem
                variant='destructive'
                onClick={() => setIsDeleteDialogOpen(true)}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={Delete01Icon} />
                <span>{t('playlists.actions.delete')}</span>
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </Show>
      </ContextMenu>

      <Show when={isMoveDialogOpen}>
        <MoveSong
          song={song}
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
        />
      </Show>

      <Show when={isDeleteDialogOpen}>
        <DeleteSong
          song={song}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          context='library'
        />
      </Show>
    </>
  )
}
