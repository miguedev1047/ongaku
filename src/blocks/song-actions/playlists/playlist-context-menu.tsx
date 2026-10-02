import * as React from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { TPlaylist } from '@/shared/types/playlist.types'
import { Show } from '@/components/utility/show'
import { DeletePlaylist, RenamePlaylist } from '@/features/playlists/components'
import { usePlaylistItem } from '@/features/playlists/hooks'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DeleteIcon,
  Music01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from 'cn'
import { CONTEXT_ACTIONS_MENU_WIDTH } from '@/constants/styles'

interface PlaylistContextMenuProps {
  playlist: TPlaylist
  children: React.ReactNode
}
export function PlaylistActionsContextMenu({
  playlist,
  children,
}: PlaylistContextMenuProps) {
  const {
    isRenameOpen,
    setIsRenameOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handleNavigate,
  } = usePlaylistItem({ playlist })

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger render={children as React.ReactElement} />
        <ContextMenuContent className={cn(CONTEXT_ACTIONS_MENU_WIDTH)}>
          <ContextMenuGroup>
            <ContextMenuItem onClick={handleNavigate}>
              <HugeiconsIcon icon={Music01Icon} />
              <span>Open</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setIsRenameOpen(true)}>
              <HugeiconsIcon icon={PencilEdit01Icon} />
              <span>Rename</span>
            </ContextMenuItem>
            <ContextMenuItem
              variant='destructive'
              onClick={() => setIsDeleteOpen(true)}
            >
              <HugeiconsIcon icon={DeleteIcon} />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <Show when={isRenameOpen}>
        <RenamePlaylist
          playlist={playlist}
          open={isRenameOpen}
          onOpenChange={setIsRenameOpen}
        />
      </Show>
      <Show when={isDeleteOpen}>
        <DeletePlaylist
          playlist={playlist}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
        />
      </Show>
    </>
  )
}
