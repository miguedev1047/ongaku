import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import {
  Delete01Icon,
  FolderIcon,
  FolderTransferIcon,
  MoreHorizontalSquare01Icon,
  PauseIcon,
  PlayIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { DeleteSong, MoveSong } from "@/features/playlist-songs/components"
import { usePlaylistSongActions } from "@/features/playlist-songs/hooks"

interface PlaylistSongItemProps {
  song: TPlaylistSong
}

export function PlaylistSongActions({ song }: PlaylistSongItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)

  const { isPlaying, handleTogglePlayback, handleOpenFolder } =
    usePlaylistSongActions({ song })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => e.stopPropagation()}
            >
              <HugeiconsIcon icon={MoreHorizontalSquare01Icon} />
            </Button>
          }
        />
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleTogglePlayback}>
              <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} />
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenFolder}>
              <HugeiconsIcon icon={FolderIcon} />
              <span>Open folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
              <HugeiconsIcon icon={FolderTransferIcon} />
              <span>Move</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
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
