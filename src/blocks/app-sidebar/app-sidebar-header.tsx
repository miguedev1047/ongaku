import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="flex flex-row items-center justify-between p-2">
      <div className="flex items-center gap-2 overflow-hidden px-1 group-data-[collapsible=icon]:hidden">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <HugeiconsIcon icon={MusicNote01Icon} className="size-4" />
        </div>
        <span className="font-semibold text-sm tracking-tight truncate">
          Ongaku
        </span>
      </div>
      <SidebarTrigger className="group-data-[collapsible=icon]:mx-auto" />
    </SidebarHeader>
  )
}
