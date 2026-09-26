import { useState } from "react"
import { useLocation } from "@tanstack/react-router"
import {
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { CollapsibleTrigger } from "@/components/ui/collapsible"
import { Playlist01Icon, PlusIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { NewPlaylist } from "@/features/playlists/components/new-playlist"
import { SearchPlaylists } from "@/components/search/search-playlists"

export function PlaylistsNavHeader() {
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const pathname = useLocation({
    select: (location) => location.pathname
  })
  const isPlaylistsActive = pathname.startsWith("/playlists")

  return (
    <>
      <CollapsibleTrigger
        render={
          <SidebarMenuItem>
            <ContextMenu>
              <ContextMenuTrigger
                render={
                  <SidebarMenuButton
                    isActive={isPlaylistsActive}
                    tooltip="Playlists"
                  >
                    <HugeiconsIcon
                      icon={Playlist01Icon}
                      className="size-4 shrink-0"
                    />
                    <span>Playlists</span>
                  </SidebarMenuButton>
                }
              />
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem onClick={() => setIsNewOpen(true)}>
                    <HugeiconsIcon icon={PlusIcon} />
                    <span>Add playlist</span>
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => setIsSearchOpen(true)}>
                    <HugeiconsIcon icon={SearchIcon} />
                    <span>Search playlist</span>
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          </SidebarMenuItem>
        }
      />

      <NewPlaylist
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        showTrigger={false}
      />
      <SearchPlaylists
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        showTrigger={false}
      />
    </>
  )
}
