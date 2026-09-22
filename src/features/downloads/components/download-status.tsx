import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Progress,
  ProgressLabel,
  ProgressValue
} from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  useDownloadsStore,
  type DownloadProgress
} from "@/shared/stores/use-downloads"
import { formatDuration } from "@/shared/helpers/format-duration"

export function DownloadStatus() {
  const isDownloading = useDownloadsStore((state) => state.isDownloading)
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

  if (!isDownloading && !song) {
    return null
  }

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {isDownloading ? (
            <>
              <Spinner className="size-3.5" />
              <span>Downloading Audio</span>
            </>
          ) : (
            <span>Last Downloaded</span>
          )}
        </CardTitle>
        <CardAction>
          <Badge variant={isDownloading ? "secondary" : "default"}>
            {isDownloading ? "In progress" : "Completed"}
          </Badge>
        </CardAction>
        <CardDescription>
          {isDownloading
            ? downloadProgress && downloadProgress.progress > 0
              ? `Downloading stream (${downloadedMb} MB${totalMb ? ` / ${totalMb} MB` : ""})`
              : "Fetching video metadata from YouTube..."
            : `Saved to playlist "${song?.playlist_name}"`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {isDownloading ? (
          <Progress value={percent}>
            <ProgressLabel>
              {percent > 0 ? "Transferring audio stream..." : "Connecting..."}
            </ProgressLabel>
            <ProgressValue />
          </Progress>
        ) : song ? (
          <div className="space-y-1 text-xs">
            <p className="font-medium text-foreground truncate">{song.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              {song.metadata.artist && <span>{song.metadata.artist}</span>}
              {song.metadata.artist && song.metadata.duration && <span>•</span>}
              {song.metadata.duration ? (
                <span>{formatDuration(song.metadata.duration)}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
