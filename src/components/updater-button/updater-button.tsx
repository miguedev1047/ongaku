import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadIcon } from "@hugeicons/core-free-icons"
import { useUpdater } from "@/hooks/use-updater"
import { usePackageType } from "@/hooks/use-package-type"
import { Show } from "@/components/utility/show"
import { DotmSquare10 } from "@/components/loaders/dotm-square-10"
import { cn } from "cn"

export function UpdaterButton() {
  const { update, progress, isPending, handleInstallUpdate } = useUpdater()
  const { supportsInAppUpdates } = usePackageType()

  if (!supportsInAppUpdates || !update) return null

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={handleInstallUpdate}
            size="icon"
            disabled={isPending}
            className={cn("relative overflow-hidden")}
          >
            <Show
              when={!isPending}
              fallback={
                <div className={cn("size-4 flex items-center justify-center text-primary-foreground")}>
                  <DotmSquare10 size={14} dotSize={2} speed={1.5} />
                </div>
              }
            >
              <HugeiconsIcon
                icon={DownloadIcon}
                className={cn("animate-bounce")}
              />
            </Show>
          </Button>
        }
      />
      <TooltipContent>
        <Show
          when={isPending}
          fallback={`New update available: v${update.version}. Click to update.`}
        >
          <Show
            when={progress.percentage > 0}
            fallback="Updating the app. Please wait..."
          >
            Updating... {progress.percentage}%
          </Show>
        </Show>
      </TooltipContent>
    </Tooltip>
  )
}
