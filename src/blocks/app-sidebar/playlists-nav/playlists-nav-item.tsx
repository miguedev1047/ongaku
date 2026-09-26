import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { openPath } from "@tauri-apps/plugin-opener"
import { toast } from "sonner"
import type { TPlaylist } from "@/shared/types/playlist.types"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import {
  DeleteIcon,
  FolderIcon,
  PencilEdit01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { DeletePlaylist } from "@/features/playlists/components/delete-playlist"
import { RenamePlaylist } from "@/features/playlists/components/rename-playlist"

interface PlaylistsNavItemProps {
  playlist: TPlaylist
}

export function PlaylistsNavItem({ playlist }: PlaylistsNavItemProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const setActivePlaylist = useActivePlayerStore(
    (state) => state.setActivePlaylist
  )

  const pathname = useLocation({
    select: (location) => location.pathname
  })

  const currentPlaylist = decodeURIComponent(
    pathname.replace(/^\/playlists\/?/, "")
  )
  const isActive =
    pathname.startsWith("/playlists/") && currentPlaylist === playlist.name

  const handleOpenFolder = async () => {
    try {
      await openPath(playlist.path)
      toast.info(`Opened folder for "${playlist.name}"`)
    } catch {
      toast.error("Error opening playlist folder")
    }
  }

  return (
    <SidebarMenuSubItem>
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <SidebarMenuSubButton
              isActive={isActive}
              render={
                <Link
                  to="/playlists/$playlistName"
                  params={{ playlistName: playlist.name }}
                  onClick={() => setActivePlaylist(playlist.name)}
                />
              }
            >
              <span>{playlist.name}</span>
            </SidebarMenuSubButton>
          }
        />
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem onClick={handleOpenFolder}>
              <HugeiconsIcon icon={FolderIcon} />
              <span>Open</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setIsRenameOpen(true)}>
              <HugeiconsIcon icon={PencilEdit01Icon} />
              <span>Rename</span>
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              <HugeiconsIcon icon={DeleteIcon} />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <RenamePlaylist
        playlist={playlist}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
      />
      <DeletePlaylist
        playlist={playlist}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </SidebarMenuSubItem>
  )
}
