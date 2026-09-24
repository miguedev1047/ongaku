import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import {
  useDownloadsStore,
  type DownloadProgress
} from "@/shared/stores/use-downloads"

export function useDownloadStatus() {
  const isDownloading = useDownloadsStore((state) => state.isDownloading)
  const currentDownload = useDownloadsStore((state) => state.currentDownload)
  const song = useDownloadsStore((state) => state.song)
  const downloadProgress = useDownloadsStore((state) => state.downloadProgress)

  const setDownloadProgress = useDownloadsStore(
    (state) => state.setDownloadProgress
  )

  useEffect(() => {
    let unlistenFn: (() => void) | undefined

    listen<DownloadProgress>("download:progress", (event) => {
      if (event.payload.done) {
        setDownloadProgress(null)
      } else {
        setDownloadProgress(event.payload)
      }
    }).then((unlisten) => {
      unlistenFn = unlisten
    })

    return () => {
      unlistenFn?.()
    }
  }, [setDownloadProgress])

  const percent = downloadProgress
    ? Math.round(downloadProgress.progress * 100)
    : 0

  const downloadedMb = downloadProgress
    ? (downloadProgress.downloaded_bytes / (1024 * 1024)).toFixed(1)
    : "0"

  const totalMb =
    downloadProgress && downloadProgress.total_bytes > 0
      ? (downloadProgress.total_bytes / (1024 * 1024)).toFixed(1)
      : null

  const hasContent = isDownloading || !!song

  return {
    isDownloading,
    currentDownload,
    song,
    downloadProgress,
    percent,
    downloadedMb,
    totalMb,
    hasContent
  }
}
