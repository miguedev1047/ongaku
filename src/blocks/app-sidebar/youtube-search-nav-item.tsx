import { Link, useLocation } from "@tanstack/react-router"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function YoutubeSearchNavItem() {
  const pathname = useLocation({
    select: (location) => location.pathname
  })
  const isYoutubeActive = pathname.startsWith("/search-youtube")

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isYoutubeActive}
        tooltip="YouTube Search"
        render={
          <Link
            to="/search-youtube"
            search={{ q: "" }}
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
