import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Delete01Icon,
  ImportIcon,
  MoreHorizontalSquare01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import { DeletePlaylist } from '@/features/playlists/components'
import { usePlaylistActions } from '@/blocks/song-actions/playlists/hooks'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'

export interface PlaylistActionsProps {
  playlistName?: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
}

export function PlaylistHeroActions({
  playlistName,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
}: PlaylistActionsProps) {
  const {
    playlist,
    isImporting,
    isDeleteOpen,
    setIsDeleteOpen,
    handleImportSongs,
  } = usePlaylistActions({ playlistName })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size={size}
              variant={variant}
              onClick={(e) => e.stopPropagation()}
              disabled={isImporting}
              aria-label='Playlist actions'
              className={cn('cursor-pointer', className)}
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
          className={cn(DROPDOWN_ACTIONS_MENU_WIDTH)}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleImportSongs}
              className={cn('cursor-pointer')}
            >
              <HugeiconsIcon icon={ImportIcon} />
              <span>Import songs</span>
            </DropdownMenuItem>

            <Show when={playlist}>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setIsDeleteOpen(true)}
                className={cn('cursor-pointer')}
              >
                <HugeiconsIcon icon={Delete01Icon} />
                <span>Delete</span>
              </DropdownMenuItem>
            </Show>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Show when={isDeleteOpen && playlist}>
        {(p) => (
          <DeletePlaylist
            playlist={p}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        )}
      </Show>
    </>
  )
}
