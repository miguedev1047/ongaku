import { Link } from "@tanstack/react-router"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function YoutubeSearchNav() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="YouTube Search"
        render={
          <Link
            to="/search-youtube"
            search={{ q: "" }}
            activeOptions={{ includeSearch: false, exact: true }}
            activeProps={{ className: "bg-accent" }}
          />
        }
      >
        <HugeiconsIcon
          icon={YoutubeIcon}
          className="size-4 shrink-0"
        />
        <span className="truncate">YouTube Search</span>
        <SidebarMenuBadge>
          <Badge
            variant="destructive"
            className="text-[9px] px-1 py-0 h-3.5 leading-none"
          >
            Alpha
          </Badge>
        </SidebarMenuBadge>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
