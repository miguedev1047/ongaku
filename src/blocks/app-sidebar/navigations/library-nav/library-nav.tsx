import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { LibraryIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

export function LibraryNav() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="Library"
        render={
          <Link
            to="/library"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-accent" }}
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
