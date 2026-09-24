import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { checkBinariesQueryOpts } from "@/shared/queries/binaries"
import { CheckIcon, DownloadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

export function CheckBinaries() {
  const { data: isBinariesInstalled } = useSuspenseQuery(
    checkBinariesQueryOpts()
  )

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await invoke("download_binaries")
    },
    onSuccess: () => {
      toast.success("Binaries installed successfully")
      queryClient.invalidateQueries({ queryKey: ["check-binaries"] })
    },
    onError: () => {
      toast.error("An error occurred while downloading the binaries")
    }
  })

  const isPending = mutation.isPending

  const handleDownloadBinaries = () => {
    mutation.mutate()
  }

  if (!isBinariesInstalled)
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={handleDownloadBinaries}
              disabled={isPending}
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon icon={DownloadIcon} />
            </Button>
          }
        />
        <TooltipContent>Install the Yt-dlp and Ffmpeg</TooltipContent>
      </Tooltip>
    )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon icon={CheckIcon} />
          </Button>
        }
      />
      <TooltipContent>YT-Dlp and Ffmpe are installed</TooltipContent>
    </Tooltip>
  )
}
