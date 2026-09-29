import { cn } from "cn"
import {
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { useAppStatus } from "@/features/settings/hooks"
import { StatusIcon, StatusBadge, CollapsedIndicator } from '@/blocks/app-sidebar/components/settings-nav-status'

export function SettingsNav() {
  const { status, badgeText, tooltipText } = useAppStatus()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={tooltipText}
        render={
          <Link
            to="/settings"
            activeOptions={{ exact: false }}
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          />
        }
        className={cn(
          "relative",
          status === "error" && "text-destructive hover:text-destructive",
          status === "update" && "text-primary hover:text-primary"
        )}
      >
        <StatusIcon status={status} />
        <span className="truncate">Settings</span>
        <StatusBadge
          status={status}
          badgeText={badgeText}
        />
        <CollapsedIndicator status={status} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
