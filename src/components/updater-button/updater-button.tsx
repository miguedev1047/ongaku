import { useQuery, useMutation } from "@tanstack/react-query"
import { updatesQueryOpts } from "@/shared/queries/updates"
import { useUpdateStore } from "@/shared/stores/use-update"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { relaunch } from "@tauri-apps/plugin-process"

const RESTARTING_DELAY = 1500

export function UpdaterButton() {
  const { data: update } = useQuery(updatesQueryOpts())
  const progress = useUpdateStore((state) => state.progress)
  const setProgress = useUpdateStore((state) => state.setProgress)
  const setStatus = useUpdateStore((state) => state.setStatus)
  const reset = useUpdateStore((state) => state.reset)

  const { mutate: installUpdate, isPending } = useMutation({
    mutationFn: async () => {
      if (!update) return

      setStatus("downloading")
      let downloaded = 0
      let total = 0

      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0
          setProgress(0, total)
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength
          setProgress(downloaded, total)
        } else if (event.event === "Finished") {
          setStatus("installing")
        }
      })
    },
    onMutate: () => {
      toast.loading("Downloading update. Please wait...", { id: "updater-toast" })
    },
    onSuccess: () => {
      setStatus("done")
      toast.success("Update installed successfully! Restarting app...", {
        id: "updater-toast"
      })
      setTimeout(async () => {
        await relaunch()
      }, RESTARTING_DELAY)
    },
    onError: (err) => {
      setStatus("error")
      reset()
      toast.error("Failed to update the app. Please try again.", {
        id: "updater-toast"
      })
      console.error(err)
    }
  })

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
            onClick={() => installUpdate()}
            size="icon"
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <HugeiconsIcon
                icon={DownloadIcon}
                className="animate-bounce"
              />
            )}
          </Button>
        }
      />
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
