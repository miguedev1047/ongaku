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
import { openFolder } from "@/shared/helpers/open-folder"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Show } from "@/components/utility/show"
import { DotmSquare10 } from "@/components/generic/loaders/dotm-square-10"
import { cn } from "cn"

interface StatusProps {
  isPending: boolean
  isInstalled: boolean
}

function BinaryStatusIcon({ isPending, isInstalled }: StatusProps) {
  return (
    <Show
      when={!isPending}
      fallback={
        <div className={cn("size-4 shrink-0 flex items-center justify-center text-primary")}>
          <DotmSquare10 size={14} dotSize={2} speed={1.5} />
        </div>
      }
    >
      <Show
        when={isInstalled}
        fallback={
          <HugeiconsIcon
            icon={Download01Icon}
            className={cn("size-4 shrink-0 text-amber-500 animate-pulse")}
          />
        }
      >
        <HugeiconsIcon
          icon={FolderIcon}
          className={cn("size-4 shrink-0 text-muted-foreground")}
        />
      </Show>
    </Show>
  )
}

function BinaryMenuBadge({ isPending, isInstalled }: StatusProps) {
  return (
    <Show
      when={!isPending}
      fallback={
        <SidebarMenuBadge className={cn("text-[10px]")}>
          <Spinner className={cn("size-3")} />
        </SidebarMenuBadge>
      }
    >
      <Show when={!isInstalled}>
        <SidebarMenuBadge
          className={cn(
            "bg-amber-500/10 text-amber-500 font-medium text-[10px]"
          )}
        >
          Missing
        </SidebarMenuBadge>
      </Show>
    </Show>
  )
}

function BinaryOverallBadge({ isPending, isInstalled }: StatusProps) {
  return (
    <Show
      when={!isPending}
      fallback={
        <Badge
          variant="outline"
          className={cn("text-[10px] h-5 gap-1")}
        >
          <Spinner className={cn("size-2.5")} /> Installing
        </Badge>
      }
    >
      <Show
        when={isInstalled}
        fallback={
          <Badge
            variant="destructive"
            className={cn("text-[10px] h-5")}
          >
            Missing
          </Badge>
        }
      >
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          )}
        >
          Installed
        </Badge>
      </Show>
    </Show>
  )
}

function BinaryItemBadge({ isReady }: { isReady: boolean }) {
  return (
    <Show
      when={isReady}
      fallback={
        <Badge
          variant="outline"
          className={cn("text-[10px] h-5 text-amber-500 border-amber-500/30")}
        >
          Missing
        </Badge>
      }
    >
      <Badge
        variant="outline"
        className={cn("text-[10px] h-5 text-emerald-500 border-emerald-500/30")}
      >
        Ready
      </Badge>
    </Show>
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
  return (
    <Show
      when={!isPending}
      fallback={
        <Button
          disabled
          size="sm"
          className={cn("w-full text-xs gap-1.5")}
        >
          <Spinner className={cn("size-3.5")} />
          <span className={cn("truncate")}>Installing tools...</span>
        </Button>
      }
    >
      <Show when={!isInstalled}>
        <Button
          onClick={onInstall}
          size="sm"
          className={cn("w-full text-xs gap-1.5")}
        >
          <HugeiconsIcon
            icon={Download01Icon}
            className={cn("size-3.5")}
          />
          <span className={cn("truncate")}>Install Tools</span>
        </Button>
      </Show>
    </Show>
  )
}

export function CheckBinaries() {
  const { isBinariesInstalled, binariesInfo, isPending, installBinaries } =
    useBinaries()

  const handleOpenFolder = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!binariesInfo?.bin_dir) return
    try {
      await openFolder(binariesInfo.bin_dir)
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
                <Show
                  when={isBinariesInstalled}
                  fallback="Install Tools"
                >
                  Tools & Binaries
                </Show>
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
          className={cn(
            "w-100 p-3.5 space-y-3 bg-popover/95 backdrop-blur border border-border shadow-lg rounded-md"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-border/40 pb-2.5"
            )}
          >
            <div className={cn("flex items-center gap-2")}>
              <div
                className={cn(
                  "size-7 rounded-md bg-muted flex items-center justify-center"
                )}
              >
                <HugeiconsIcon
                  icon={FolderIcon}
                  className={cn("size-4 text-foreground")}
                />
              </div>
              <div>
                <h4 className={cn("text-xs font-semibold text-foreground")}>
                  Auxiliary Binaries
                </h4>
                <p className={cn("text-[11px] text-muted-foreground")}>
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
          <div className={cn("space-y-1.5")}>
            <div
              className={cn(
                "flex items-center justify-between text-xs p-2 rounded-md bg-muted/30 border border-border/30"
              )}
            >
              <div className={cn("flex flex-col")}>
                <span
                  className={cn("font-mono font-medium text-foreground")}
                >
                  yt-dlp
                </span>
                <span className={cn("text-[10px] text-muted-foreground")}>
                  Stream extraction & metadata
                </span>
              </div>
              <BinaryItemBadge
                isReady={Boolean(binariesInfo?.ytdlp_installed)}
              />
            </div>

            <div
              className={cn(
                "flex items-center justify-between text-xs p-2 rounded-md bg-muted/30 border border-border/30"
              )}
            >
              <div className={cn("flex flex-col")}>
                <span
                  className={cn("font-mono font-medium text-foreground")}
                >
                  ffmpeg
                </span>
                <span className={cn("text-[10px] text-muted-foreground")}>
                  Audio transcoding & ID3 tagging
                </span>
              </div>
              <BinaryItemBadge
                isReady={Boolean(binariesInfo?.ffmpeg_installed)}
              />
            </div>
          </div>

          {/* Folder Path & Open Button */}
          <div className={cn("space-y-1")}>
            <div
              className={cn(
                "flex items-center justify-between text-[11px] text-muted-foreground"
              )}
            >
              <span>Binaries location:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFolder}
                className={cn(
                  "h-6 px-1.5 text-[11px] gap-1 text-primary hover:text-primary rounded-md"
                )}
              >
                <HugeiconsIcon
                  icon={FolderIcon}
                  className={cn("size-3")}
                />
                Open folder
              </Button>
            </div>
            <div
              onClick={handleOpenFolder}
              className={cn(
                "font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/40 rounded-md px-2 py-1 truncate cursor-pointer hover:border-border hover:text-foreground transition-colors"
              )}
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
