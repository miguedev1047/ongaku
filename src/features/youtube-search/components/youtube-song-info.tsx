import { useState } from "react"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import {
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { formatDuration } from "@/shared/helpers/format-duration"
import { YoutubeSongActions } from "./actions"
import { cn } from "cn"

interface YoutubeSongInfoProps {
  className?: string
}

export function YoutubeSongInfo({ className }: YoutubeSongInfoProps) {
  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const isPlaying = useStreamingPlayerStore(
    (state) => state.playerState === "playing"
  )
  const isLoading = useStreamingPlayerStore(
    (state) => state.playerState === "loading"
  )
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const [imageError, setImageError] = useState(false)

  if (!currentTrack) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 border border-dashed h-full",
          className
        )}
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Music01Icon} />
            </EmptyMedia>
            <EmptyTitle>No active track</EmptyTitle>
            <EmptyDescription>
              Select any song from search to view details and stream.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-4 border bg-card/60 backdrop-blur-sm shadow-sm h-full",
        className
      )}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border/50 shadow-sm shrink-0">
        {currentTrack.thumbnail && !imageError ? (
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="size-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-accent">
            <HugeiconsIcon
              icon={Music01Icon}
              className="size-8 text-muted-foreground"
            />
          </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge
            variant="destructive"
            className="text-[10px] px-1.5 py-0.5 bg-red-600/90 text-white flex items-center gap-1 shadow"
          >
            <HugeiconsIcon
              icon={YoutubeIcon}
              className="size-2.5"
            />
            <span>Stream</span>
          </Badge>

          {isPlaying && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 border-primary/60 text-primary bg-background/80 backdrop-blur-xs animate-pulse shadow"
            >
              Playing
            </Badge>
          )}
        </div>

        {currentTrack.duration ? (
          <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 text-white font-mono px-1.5 py-0.5 rounded leading-none shadow">
            {formatDuration(currentTrack.duration)}
          </span>
        ) : null}
      </div>

      {/* Song Details */}
      <div className="flex flex-col gap-1 min-w-0">
        <h2
          className="text-sm md:text-base font-semibold line-clamp-2 leading-snug"
          title={currentTrack.title}
        >
          {currentTrack.title}
        </h2>
        <p
          className="text-xs text-muted-foreground line-clamp-1"
          title={currentTrack.channel}
        >
          {currentTrack.channel}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Button
          size="sm"
          variant={isPlaying ? "default" : "outline"}
          onClick={togglePlay}
          className="flex-1 gap-1.5"
          disabled={isLoading}
        >
          <HugeiconsIcon
            icon={isPlaying ? PauseIcon : PlayIcon}
            className="size-3.5"
          />
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </Button>

        <YoutubeSongActions item={currentTrack} />
      </div>
    </Card>
  )
}
