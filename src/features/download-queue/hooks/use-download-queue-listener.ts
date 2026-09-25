import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import {
  useDownloadQueueStore,
  type DownloadProgressPayload
} from "@/shared/stores/use-download-queue"

export function useDownloadQueueListener() {
  const updateProgress = useDownloadQueueStore((s) => s._updateProgress)

  useEffect(() => {
    let unlistenFn: (() => void) | undefined

    listen<DownloadProgressPayload>("download:progress", (event) => {
      updateProgress(event.payload)
    }).then((unlisten) => {
      unlistenFn = unlisten
    })

    return () => {
      unlistenFn?.()
    }
  }, [updateProgress])
}
