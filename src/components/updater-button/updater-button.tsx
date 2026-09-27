import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { useUpdater } from "@/hooks/use-updater"
import { Show } from "@/components/utility/show"

export function UpdaterButton() {
  const { update, progress, isPending, handleInstallUpdate } = useUpdater()

  if (!update) return null

  const tooltipText = isPending
    ? progress.percentage > 0
      ? `Updating... ${progress.percentage}%`
      : "Updating the app. Please wait..."
    : `New update available: v${update.version}. Click to update.`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            onClick={handleInstallUpdate}
            size="icon"
            disabled={isPending}
          >
            <Show
              when={!isPending}
              fallback={<Spinner />}
            >
              <HugeiconsIcon
                icon={DownloadIcon}
                className="animate-bounce"
              />
            </Show>
          </Button>
        }
      />
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
