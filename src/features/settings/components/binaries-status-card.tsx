import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, FolderIcon, Wrench01Icon } from "@hugeicons/core-free-icons"
import { useBinaries } from "@/features/download-queue/hooks"
import { openFolder } from "@/shared/helpers/open-folder"
import { toast } from "sonner"
import { Show } from "@/components/utility/show"
import { DotmSquare10 } from "@/components/loaders/dotm-square-10"
import { cn } from "cn"

export function BinariesStatusCard() {
  const { isBinariesInstalled, binariesInfo, isPending, installBinaries } =
    useBinaries()

  const handleOpenFolder = async () => {
    if (!binariesInfo?.bin_dir) return
    try {
      await openFolder(binariesInfo.bin_dir)
    } catch {
      toast.error("Failed to open binaries folder")
    }
  }

  const ytdlpReady = Boolean(binariesInfo?.ytdlp_installed)
  const ffmpegReady = Boolean(binariesInfo?.ffmpeg_installed)

  return (
    <div
      className={cn(
        "p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-3"
      )}
    >
      <div className={cn("flex items-center justify-between")}>
        <div className={cn("flex items-center gap-2.5")}>
          <div
            className={cn(
              "size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary"
            )}
          >
            <HugeiconsIcon
              icon={Wrench01Icon}
              className={cn("size-4")}
            />
          </div>
          <div>
            <h2 className={cn("text-sm font-semibold text-foreground")}>
              Auxiliary Binaries
            </h2>
            <p className={cn("text-xs text-muted-foreground")}>
              Tools used for YouTube search, audio transcoding, and ID3 tagging
            </p>
          </div>
        </div>

        <Show
          when={isBinariesInstalled}
          fallback={
            <Badge
              variant="destructive"
              className={cn("text-[10px]")}
            >
              Missing Tools
            </Badge>
          }
        >
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}
          >
            Installed
          </Badge>
        </Show>
      </div>

      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs")}>
        <div
          className={cn(
            "flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30"
          )}
        >
          <div>
            <span className={cn("font-mono font-medium text-foreground block")}>
              yt-dlp
            </span>
            <span
              className={cn("text-[10px] text-muted-foreground block mt-0.5")}
            >
              Metadata & stream extraction
            </span>
          </div>

          <Show
            when={ytdlpReady}
            fallback={
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] h-4 px-1.5 text-amber-500 border-amber-500/30"
                )}
              >
                Missing
              </Badge>
            }
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] h-4 px-1.5 text-emerald-500 border-emerald-500/30"
              )}
            >
              Ready
            </Badge>
          </Show>
        </div>

        <div
          className={cn(
            "flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30"
          )}
        >
          <div>
            <span className={cn("font-mono font-medium text-foreground block")}>
              ffmpeg
            </span>
            <span
              className={cn("text-[10px] text-muted-foreground block mt-0.5")}
            >
              Audio decoding & metadata injection
            </span>
          </div>

          <Show
            when={ffmpegReady}
            fallback={
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] h-4 px-1.5 text-amber-500 border-amber-500/30"
                )}
              >
                Missing
              </Badge>
            }
          >
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] h-4 px-1.5 text-emerald-500 border-emerald-500/30"
              )}
            >
              Ready
            </Badge>
          </Show>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1"
        )}
      >
        <div
          onClick={handleOpenFolder}
          className={cn(
            "font-mono text-[10px] text-muted-foreground bg-muted/40 border border-border/30 rounded-md px-2.5 py-1.5 truncate cursor-pointer hover:border-border hover:text-foreground transition-colors flex-1"
          )}
          title={binariesInfo?.bin_dir}
        >
          {binariesInfo?.bin_dir || "Resolving directory..."}
        </div>

        <div className={cn("flex items-center gap-2 shrink-0")}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFolder}
            className={cn(
              "h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            )}
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className={cn("size-3.5")}
            />
            <span>Open Folder</span>
          </Button>

          <Button
            size="sm"
            onClick={installBinaries}
            disabled={isPending}
            className={cn("h-8 text-xs gap-1.5")}
          >
            <Show
              when={!isPending}
              fallback={<Spinner className={cn("size-3.5")} />}
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className={cn("size-3.5")}
              />
            </Show>
            <span>
              <Show
                when={isPending}
                fallback={
                  <Show
                    when={isBinariesInstalled}
                    fallback="Install Tools"
                  >
                    Reinstall Tools
                  </Show>
                }
              >
                Installing...
              </Show>
            </span>
          </Button>
        </div>
      </div>

      <Show when={isPending}>
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-1 duration-200"
          )}
        >
          <div
            className={cn(
              "shrink-0 flex items-center justify-center size-8 rounded-md bg-primary/10 text-primary"
            )}
          >
            <DotmSquare10
              size={18}
              dotSize={2.5}
              speed={1.5}
            />
          </div>
          <div className={cn("min-w-0 flex-1 space-y-0.5")}>
            <p className={cn("text-xs font-semibold text-foreground")}>
              Installing Tools & Binaries
            </p>
            <p className={cn("text-[11px] text-muted-foreground truncate")}>
              Downloading and setting up yt-dlp & ffmpeg...
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}
