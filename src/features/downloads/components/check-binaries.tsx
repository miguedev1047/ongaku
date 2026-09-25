import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useBinaries } from "@/features/downloads/hooks"

interface CheckBinariesProps {
  className?: string
}

export function CheckBinaries({ className }: CheckBinariesProps) {
  const { isBinariesInstalled, isPending, installBinaries } = useBinaries()

  if (isPending) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              variant="ghost"
              disabled
              aria-label="Installing tools"
              className={className}
            >
              <Spinner className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>Installing tools (yt-dlp & ffmpeg)...</TooltipContent>
      </Tooltip>
    )
  }

  if (!isBinariesInstalled) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={installBinaries}
              size="icon"
              variant="outline"
              aria-label="Install tools"
              className="text-amber-500 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-600"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className="size-3.5 animate-pulse"
              />
            </Button>
          }
        />
        <TooltipContent>
          Missing tools: Click to install yt-dlp & ffmpeg
        </TooltipContent>
      </Tooltip>
    )
  }

  return null
}
