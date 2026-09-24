import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { formatDuration } from "@/shared/helpers/format-duration"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Download01Icon,
  FolderIcon
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"
import { useDownloadStatus } from "../hooks"

export function DownloadStatus() {
  const {
    isDownloading,
    currentDownload,
    song,
    downloadProgress,
    percent,
    downloadedMb,
    totalMb,
    hasContent
  } = useDownloadStatus()

  if (!hasContent) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="relative"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              className={`size-3.5 ${isDownloading ? "animate-pulse" : "text-muted-foreground"}`}
            />
          </Button>
        }
      />
      <PopoverContent
        align="end"
        className="w-76 p-3 flex flex-col gap-2.5 text-xs shadow-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold">
            {isDownloading ? (
              <>
                <Spinner className="size-3 text-primary" />
                <span>Downloading Audio</span>
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-3.5 text-emerald-500"
                />
                <span>Download Complete</span>
              </>
            )}
          </div>
          <Badge
            variant={isDownloading ? "secondary" : "outline"}
            className="text-[10px] px-1.5 py-0"
          >
            {isDownloading ? "In progress" : "Saved"}
          </Badge>
        </div>

        {/* Content: In Progress vs Completed */}
        {isDownloading ? (
          <div className="flex flex-col gap-1.5">
            <p
              className="text-xs font-medium text-foreground truncate"
              title={currentDownload?.title}
            >
              {currentDownload?.title || "Audio Stream"}
            </p>

            {currentDownload?.playlistName && (
              <p className="text-[11px] text-muted-foreground truncate">
                To:{" "}
                <span className="text-foreground font-medium">
                  {currentDownload.playlistName}
                </span>
              </p>
            )}

            <Progress
              value={percent}
              className="h-1.5 my-1"
            />

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>{percent > 0 ? `${percent}%` : "Connecting..."}</span>
              {downloadProgress && downloadProgress.downloaded_bytes > 0 && (
                <span>
                  {downloadedMb} MB{totalMb ? ` / ${totalMb} MB` : ""}
                </span>
              )}
            </div>
          </div>
        ) : song ? (
          <div className="flex flex-col gap-2">
            <p
              className="font-medium text-foreground truncate"
              title={song.name}
            >
              {song.name}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {song.metadata.artist && (
                <span className="line-clamp-1">{song.metadata.artist}</span>
              )}
              {song.metadata.artist && song.metadata.duration && <span>•</span>}
              {song.metadata.duration && (
                <span>{formatDuration(song.metadata.duration)}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
              <HugeiconsIcon
                icon={FolderIcon}
                className="size-3 text-muted-foreground shrink-0"
              />
              <span className="truncate">
                Saved to{" "}
                <Link
                  to="/playlists/$playlistName"
                  params={{ playlistName: song.playlist_name }}
                  className="text-foreground font-medium hover:underline"
                >
                  {song.playlist_name}
                </Link>
              </span>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
