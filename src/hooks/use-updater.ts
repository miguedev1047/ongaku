import { updatesQueryOpts } from "@/shared/queries/updates"
import { useUpdateStore } from "@/shared/stores/use-update"
import { useMutation, useQuery } from "@tanstack/react-query"
import { relaunch } from "@tauri-apps/plugin-process"
import { toast } from "sonner"

const RESTARTING_DELAY = 1500

export function useUpdater() {
  const { data: update } = useQuery(updatesQueryOpts())

  const progress = useUpdateStore((state) => state.progress)
  const setProgress = useUpdateStore((state) => state.setProgress)
  const setStatus = useUpdateStore((state) => state.setStatus)
  const reset = useUpdateStore((state) => state.reset)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!update) return
      setStatus("downloading")

      let downloaded = 0
      let total = 0

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            total = event.data.contentLength ?? 0
            setProgress(0, total)
            return
          case "Progress":
            downloaded += event.data.chunkLength
            setProgress(downloaded, total)
            return
          case "Finished":
            setStatus("installing")
            return
          default:
            return
        }
      })
    },
    onMutate: () => {
      toast.loading("Downloading update. Please wait...", {
        id: "updater-toast"
      })
    },
    onSuccess: () => {
      setStatus("done")
      toast.success("Update installed successfully! Restarting app...", {
        id: "updater-toast"
      })
      setTimeout(async () => await relaunch(), RESTARTING_DELAY)
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

  const isPending = mutation.isPending

  const handleInstallUpdate = () => mutation.mutate()

  return {
    update,
    progress,
    isPending,
    handleInstallUpdate
  }
}
