import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardWrapper } from "@/components/ui/card-wrapper"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, FolderIcon, Wrench01Icon } from "@hugeicons/core-free-icons"
import { useBinaries } from "@/features/download-queue/hooks"
import { openFolder } from "@/shared/helpers/open-folder"
import { toast } from "sonner"
import { Show } from "@/components/utility/show"
import { DotmSquare10 } from "@/components/generic/loaders/dotm-square-10"
import { useTranslation } from "react-i18next"
import { cn } from "cn"

export function BinariesStatusCard() {
  const { t } = useTranslation()
  const { isBinariesInstalled, binariesInfo, isPending, installBinaries } =
    useBinaries()

  const handleOpenFolder = async () => {
    if (!binariesInfo?.bin_dir) return
    try {
      await openFolder(binariesInfo.bin_dir)
    } catch {
      toast.error(t('toasts.tools.open_folder_error'))
    }
  }

  const ytdlpReady = Boolean(binariesInfo?.ytdlp_installed)
  const ffmpegReady = Boolean(binariesInfo?.ffmpeg_installed)

  return (
    <CardWrapper spacing='compact'>
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
              {t('settings.tabs.system.binaries_status.title')}
            </h2>
            <p className={cn("text-xs text-muted-foreground")}>
              {t('settings.tabs.system.binaries_status.description')}
            </p>
          </div>
        </div>

        <Show
          when={isBinariesInstalled}
          fallback={
            <Badge
              variant="destructive"
              className={cn("text-2xs")}
            >
              {t('settings.tabs.system.binaries_status.status.missing')}
            </Badge>
          }
        >
          <Badge
            variant="success"
            className={cn("text-2xs")}
          >
            {t('settings.tabs.system.binaries_status.status.installed')}
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
              className={cn("text-2xs text-muted-foreground block mt-0.5")}
            >
              {t('settings.tabs.system.binaries_status.ytdlp_desc')}
            </span>
          </div>

          <Show
            when={ytdlpReady}
            fallback={
              <Badge
                variant="warning"
                size="sm"
              >
                {t('settings.tabs.system.binaries_status.status.missing')}
              </Badge>
            }
          >
            <Badge
              variant="success"
              size="sm"
            >
              {t('settings.tabs.system.binaries_status.status.installed')}
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
              className={cn("text-2xs text-muted-foreground block mt-0.5")}
            >
              {t('settings.tabs.system.binaries_status.ffmpeg_desc')}
            </span>
          </div>

          <Show
            when={ffmpegReady}
            fallback={
              <Badge
                variant="warning"
                size="sm"
              >
                {t('settings.tabs.system.binaries_status.status.missing')}
              </Badge>
            }
          >
            <Badge
              variant="success"
              size="sm"
            >
              {t('settings.tabs.system.binaries_status.status.installed')}
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
            "font-mono text-2xs text-muted-foreground bg-muted/40 border border-border/30 rounded-md px-2.5 py-1.5 truncate cursor-pointer hover:border-border hover:text-foreground transition-colors flex-1"
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
            className="h-8 gap-1.5"
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className="size-3.5"
            />
            <span>{t('settings.tabs.system.binaries_status.open_folder')}</span>
          </Button>

          <Button
            size="sm"
            onClick={installBinaries}
            disabled={isPending}
            className="h-8 gap-1.5"
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
                    fallback={t('settings.tabs.system.binaries_status.install')}
                  >
                    {t('settings.tabs.system.binaries_status.reinstall')}
                  </Show>
                }
              >
                {t('settings.tabs.system.binaries_status.installing')}
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
              {t('settings.tabs.system.binaries_status.installing_title')}
            </p>
            <p className={cn("text-xs text-muted-foreground truncate")}>
              {t('settings.tabs.system.binaries_status.installing_desc')}
            </p>
          </div>
        </div>
      </Show>
    </CardWrapper>
  )
}
