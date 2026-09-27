import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { isActivePathname } from "@/shared/helpers/is-active-path"
import { LibraryIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"

export function LibraryNav() {
  const isLibraryActive = isActivePathname("/library")

  const handleClick = () => {
    useLocalPlayerStore.getState().setPlaybackContext({ type: "library" })
    useActivePlayerStore.getState().setActivePlaylist("Library")
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isLibraryActive}
        tooltip="Library"
        render={
          <Link
            to="/library"
            onClick={handleClick}
          />
        }
      >
        <HugeiconsIcon
          icon={LibraryIcon}
          className="size-4 shrink-0"
        />
        <span className="truncate">Library</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
