import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete01Icon,
  MoreHorizontalIcon,
  PencilEdit01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { TPlaylist } from "@/shared/types/playlist.types"
import { RenamePlaylist } from "./rename-playlist"
import { DeletePlaylist } from "./delete-playlist"

interface PlaylistItemActionsProps {
  playlist: TPlaylist
}

export function PlaylistItemActions({ playlist }: PlaylistItemActionsProps) {
  const [dialogAction, setDialogAction] = useState<"rename" | "delete" | null>(
    null
  )

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              className="group-hover/item:opacity-100 opacity-0"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </Button>
          }
        />
        <DropdownMenuContent className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setDialogAction("rename")}>
              <HugeiconsIcon icon={PencilEdit01Icon} />
              Rename playlist
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDialogAction("delete")}
            >
              <HugeiconsIcon icon={Delete01Icon} />
              Delete playlist
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenamePlaylist
        playlist={playlist}
        open={dialogAction === "rename"}
        onOpenChange={(open) => !open && setDialogAction(null)}
      />

      <DeletePlaylist
        playlist={playlist}
        open={dialogAction === "delete"}
        onOpenChange={(open) => !open && setDialogAction(null)}
      />
    </>
  )
}
