import * as React from 'react'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
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
import { useCopySongTitle } from '@/blocks/song-actions/shared/use-copy-song-title'
import { useLibrarySongActions } from '@/blocks/song-actions/library-songs/hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { CONTEXT_ACTIONS_MENU_WIDTH } from '@/constants/styles'

export interface LibrarySongContextMenuProps {
  song: TPlaylistSong
  children: React.ReactNode
}

export function LibrarySongContextMenu({
  song,
  children,
}: LibrarySongContextMenuProps) {
  const {
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = useLibrarySongActions({ song })

  const { copySongTitle } = useCopySongTitle()

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children as React.ReactElement} />
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
                    <span>Play</span>
                  </>
                }
              >
                <HugeiconsIcon icon={PauseIcon} />
                <span>Pause</span>
              </Show>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => copySongTitle(song.name)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Copy01Icon} />
              <span>Copy title</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={handleOpenFolder}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderIcon} />
              <span>Open folder</span>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => setIsMoveDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderTransferIcon} />
              <span>Move</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              variant='destructive'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Delete01Icon} />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <MoveSong
        song={song}
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
      />

      <DeleteSong
        song={song}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        context='library'
      />
    </>
  )
}
