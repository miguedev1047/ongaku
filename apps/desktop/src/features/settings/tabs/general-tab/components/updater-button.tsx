import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ongaku/ui"
import { Button } from "@ongaku/ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadIcon } from "@hugeicons/core-free-icons"
import { useUpdater } from "@/features/settings/hooks/use-updater"
import { Show } from "@ongaku/ui"
import { DotmSquare10 } from "@ongaku/ui"
import { cn } from "cn"

export function UpdaterButton() {
  const { update, progress, isPending, handleInstallUpdate } = useUpdater()

  return (
    <Show when={Boolean(update)}>
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
            fallback={`New update available: v${update?.version}. Click to update.`}
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
    </Show>
  )
}
