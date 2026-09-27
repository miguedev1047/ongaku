import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Download01Icon, FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useBinaries } from "@/features/download-queue/hooks"
import { openPath } from "@tauri-apps/plugin-opener"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

interface StatusProps {
  isPending: boolean
  isInstalled: boolean
}

function BinaryStatusIcon({ isPending, isInstalled }: StatusProps) {
  if (isPending) {
    return <Spinner className="size-4 shrink-0" />
  }

  if (!isInstalled) {
    return (
      <HugeiconsIcon
        icon={Download01Icon}
        className="size-4 shrink-0 text-amber-500 animate-pulse"
      />
    )
  }

  return (
    <HugeiconsIcon
      icon={FolderIcon}
      className="size-4 shrink-0 text-muted-foreground"
    />
  )
}

function BinaryMenuBadge({ isPending, isInstalled }: StatusProps) {
  if (isPending) {
    return (
      <SidebarMenuBadge className="text-[10px]">
        <Spinner className="size-3" />
      </SidebarMenuBadge>
    )
  }

  if (!isInstalled) {
    return (
      <SidebarMenuBadge className="bg-amber-500/10 text-amber-500 font-medium text-[10px]">
        Missing
      </SidebarMenuBadge>
    )
  }

  return null
}

function BinaryOverallBadge({ isPending, isInstalled }: StatusProps) {
  if (isPending) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] h-5 gap-1"
      >
        <Spinner className="size-2.5" /> Installing
      </Badge>
    )
  }

  if (isInstalled) {
    return (
      <Badge
        variant="secondary"
        className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      >
        Installed
      </Badge>
    )
  }

  return (
    <Badge
      variant="destructive"
      className="text-[10px] h-5"
    >
      Missing
    </Badge>
  )
}

function BinaryItemBadge({ isReady }: { isReady: boolean }) {
  if (isReady) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] h-5 text-emerald-500 border-emerald-500/30"
      >
        Ready
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="text-[10px] h-5 text-amber-500 border-amber-500/30"
    >
      Missing
    </Badge>
  )
}

interface BinaryActionSectionProps extends StatusProps {
  onInstall: () => void
}

function BinaryActionSection({
  isPending,
  isInstalled,
  onInstall
}: BinaryActionSectionProps) {
  if (isPending) {
    return (
      <Button
        disabled
        size="sm"
        className="w-full text-xs gap-1.5"
      >
        <Spinner className="size-3.5" />
        <span className="truncate">Installing tools...</span>
      </Button>
    )
  }

  if (!isInstalled) {
    return (
      <Button
        onClick={onInstall}
        size="sm"
        className="w-full text-xs gap-1.5"
      >
        <HugeiconsIcon
          icon={Download01Icon}
          className="size-3.5"
        />
        <span className="truncate">Install Tools</span>
      </Button>
    )
  }

  return null
}

export function CheckBinaries() {
  const { isBinariesInstalled, binariesInfo, isPending, installBinaries } =
    useBinaries()

  const handleOpenFolder = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!binariesInfo?.bin_dir) return
    try {
      await openPath(binariesInfo.bin_dir)
    } catch {
      toast.error("Failed to open binaries folder")
    }
  }

  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger
          render={
            <SidebarMenuButton
              tooltip={
                isBinariesInstalled ? "Tools & Binaries" : "Install Tools"
              }
            >
              <BinaryStatusIcon
                isPending={isPending}
                isInstalled={isBinariesInstalled}
              />
              <span>
                {isBinariesInstalled ? "Tools & Binaries" : "Install Tools"}
              </span>
              <BinaryMenuBadge
                isPending={isPending}
                isInstalled={isBinariesInstalled}
              />
            </SidebarMenuButton>
          }
        />
        <PopoverContent
          sideOffset={8}
          className="w-100 p-3.5 space-y-3 bg-popover/95 backdrop-blur border border-border shadow-lg rounded-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-muted flex items-center justify-center">
                <HugeiconsIcon
                  icon={FolderIcon}
                  className="size-4 text-foreground"
                />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  Auxiliary Binaries
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Dependencies for YouTube & audio
                </p>
              </div>
            </div>
            <BinaryOverallBadge
              isPending={isPending}
              isInstalled={isBinariesInstalled}
            />
          </div>

          {/* Tool Items list */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/30 border border-border/30">
              <div className="flex flex-col">
                <span className="font-mono font-medium text-foreground">
                  yt-dlp
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Stream extraction & metadata
                </span>
              </div>
              <BinaryItemBadge
                isReady={Boolean(binariesInfo?.ytdlp_installed)}
              />
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/30 border border-border/30">
              <div className="flex flex-col">
                <span className="font-mono font-medium text-foreground">
                  ffmpeg
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Audio transcoding & ID3 tagging
                </span>
              </div>
              <BinaryItemBadge
                isReady={Boolean(binariesInfo?.ffmpeg_installed)}
              />
            </div>
          </div>

          {/* Folder Path & Open Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Binaries location:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFolder}
                className="h-6 px-1.5 text-[11px] gap-1 text-primary hover:text-primary rounded-md"
              >
                <HugeiconsIcon
                  icon={FolderIcon}
                  className="size-3"
                />
                Open folder
              </Button>
            </div>
            <div
              onClick={handleOpenFolder}
              className="font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/40 rounded-md px-2 py-1 truncate cursor-pointer hover:border-border hover:text-foreground transition-colors"
              title={binariesInfo?.bin_dir}
            >
              {binariesInfo?.bin_dir || "Loading..."}
            </div>
          </div>

          {/* Action button */}
          <BinaryActionSection
            isPending={isPending}
            isInstalled={isBinariesInstalled}
            onInstall={installBinaries}
          />
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}
