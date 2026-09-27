import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

export function PlaylistNav() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="Playlists"
        render={
          <Link
            to="/playlists"
            activeOptions={{ includeHash: true }}
            activeProps={{ className: "bg-accent" }}
          />
        }
      >
        <HugeiconsIcon
          icon={FolderIcon}
          className="size-4 shrink-0"
        />
        <span className="truncate">Playlists</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
