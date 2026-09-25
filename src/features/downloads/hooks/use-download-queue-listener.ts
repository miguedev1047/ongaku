import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import {
  useDownloadsStore,
  type DownloadProgressPayload
} from "@/shared/stores/use-downloads"

export function useDownloadQueueListener() {
  const updateProgress = useDownloadsStore((s) => s._updateProgress)

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
