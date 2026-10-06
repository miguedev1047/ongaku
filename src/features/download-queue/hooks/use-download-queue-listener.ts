import { useEffect } from "react"
import { platformService } from "@/infrastructure/platform"
import { useDownloadQueueStore } from "@/shared/stores/actions"

export function useDownloadQueueListener() {
  const updateProgress = useDownloadQueueStore((s) => s._updateProgress)

  useEffect(() => {
    let unlistenFn: (() => void) | undefined

    platformService.on("download:progress", (payload) => {
      updateProgress(payload)
    }).then((unlisten) => {
      unlistenFn = unlisten
    })

    return () => {
      unlistenFn?.()
    }
  }, [updateProgress])
}
