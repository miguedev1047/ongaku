import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import {
  Delete01Icon,
  FolderIcon,
  FolderTransferIcon,
  MoreHorizontalSquare01Icon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteSong, MoveSong } from '@/features/playlist-songs/components'
import { CopySongMenuItem } from '@/blocks/song-actions/shared'
import { useLibrarySongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'

export interface LibrarySongActionsProps {
  song: TPlaylistSong
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
}

export function LibrarySongActions({
  song,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
}: LibrarySongActionsProps) {
  const {
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = useLibrarySongActions({ song })

  return (
    <>
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
          className='w-44'
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
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
            </DropdownMenuItem>

            <CopySongMenuItem title={song.name} />

            <DropdownMenuItem
              onClick={handleOpenFolder}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderIcon} />
              <span>Open folder</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsMoveDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderTransferIcon} />
              <span>Move</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant='destructive'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Delete01Icon} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoveSong
        song={song}
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
      />

      <DeleteSong
        song={song}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  )
}
