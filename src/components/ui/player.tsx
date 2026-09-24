import * as React from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NativeSlider } from "@/components/ui/native-slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { formatDuration } from "@/shared/helpers/format-duration"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBack,
  SkipForward,
  Volume02Icon,
  VolumeLowIcon,
  VolumeMute02Icon
} from "@hugeicons/core-free-icons"

function Player({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player"
      className={cn(
        "w-full p-4 shrink-0 border-t border-border bg-card flex items-center gap-4",
        className
      )}
      {...props}
    />
  )
}

function PlayerMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-media"
      className={cn(
        "relative size-20 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center border border-border/50 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function PlayerContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-content"
      className={cn(
        "flex-1 min-w-0 flex flex-col justify-between gap-1",
        className
      )}
      {...props}
    />
  )
}

function PlayerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-header"
      className={cn(
        "flex items-center justify-between gap-4 w-full",
        className
      )}
      {...props}
    />
  )
}

function PlayerControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-controls"
      className={cn("flex items-center gap-1 shrink-0", className)}
      {...props}
    />
  )
}

function PlayerTrackInfo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-track-info"
      className={cn(
        "hidden sm:flex flex-col min-w-0 max-w-sm mr-auto px-2",
        className
      )}
      {...props}
    />
  )
}

function PlayerTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="player-title"
      className={cn("text-xs font-medium truncate leading-tight", className)}
      {...props}
    />
  )
}

function PlayerDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="player-description"
      className={cn(
        "text-[11px] text-muted-foreground truncate leading-tight",
        className
      )}
      {...props}
    />
  )
}

interface PlayerPlayButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  isPlaying?: boolean
  isLoading?: boolean
}

function PlayerPlayButton({
  isPlaying,
  isLoading,
  className,
  ...props
}: PlayerPlayButtonProps) {
  return (
    <Button
      data-slot="player-play-button"
      size="icon"
      variant={isPlaying ? "default" : "outline"}
      className={cn("size-8", className)}
      aria-label={isPlaying ? "Pause" : "Play"}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Spinner className="size-3.5" />
      ) : (
        <HugeiconsIcon
          icon={isPlaying ? PauseIcon : PlayIcon}
          className="size-3.5"
        />
      )}
    </Button>
  )
}

interface PlayerPreviousButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {}

function PlayerPreviousButton({
  className,
  ...props
}: PlayerPreviousButtonProps) {
  return (
    <Button
      data-slot="player-previous-button"
      size="icon"
      variant="outline"
      className={cn("size-7", className)}
      aria-label="Previous track"
      {...props}
    >
      <HugeiconsIcon
        icon={SkipBack}
        className="size-3.5"
      />
    </Button>
  )
}

interface PlayerNextButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {}

function PlayerNextButton({ className, ...props }: PlayerNextButtonProps) {
  return (
    <Button
      data-slot="player-next-button"
      size="icon"
      variant="outline"
      className={cn("size-7", className)}
      aria-label="Next track"
      {...props}
    >
      <HugeiconsIcon
        icon={SkipForward}
        className="size-3.5"
      />
    </Button>
  )
}

interface PlayerShuffleButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  isShuffle?: boolean
}

function PlayerShuffleButton({
  isShuffle,
  className,
  ...props
}: PlayerShuffleButtonProps) {
  return (
    <Button
      data-slot="player-shuffle-button"
      size="icon"
      variant={isShuffle ? "default" : "outline"}
      className={cn("size-7", className)}
      aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
      {...props}
    >
      <HugeiconsIcon
        icon={ShuffleIcon}
        className="size-3.5"
      />
    </Button>
  )
}

interface PlayerLoopButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  isLoop?: boolean
}

function PlayerLoopButton({
  isLoop,
  className,
  ...props
}: PlayerLoopButtonProps) {
  return (
    <Button
      data-slot="player-loop-button"
      size="icon"
      variant={isLoop ? "default" : "outline"}
      className={cn("size-7", className)}
      aria-label={isLoop ? "Disable loop" : "Enable loop"}
      {...props}
    >
      <HugeiconsIcon
        icon={RepeatIcon}
        className="size-3.5"
      />
    </Button>
  )
}

interface PlayerProgressProps {
  progress: number
  duration: number
  onSeek?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  className?: string
}

function PlayerProgress({
  progress,
  duration,
  onSeek,
  onPointerDown,
  onPointerUp,
  className
}: PlayerProgressProps) {
  return (
    <div
      data-slot="player-progress"
      className={cn("w-full", className)}
    >
      <NativeSlider
        min={0}
        max={duration || 0}
        value={progress}
        onChange={onSeek}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="w-full"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>{formatDuration(progress)}</p>
        <p>{formatDuration(duration)}</p>
      </div>
    </div>
  )
}

interface PlayerVolumeProps {
  volume: number
  onChange: (val: number) => void
  className?: string
}

function PlayerVolume({ volume, onChange, className }: PlayerVolumeProps) {
  const [lastVolume, setLastVolume] = React.useState<number>(
    volume > 0 ? volume : 5
  )

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intValue = parseInt(e.target.value, 10)
    if (intValue > 0) {
      setLastVolume(intValue)
    }
    onChange(intValue)
  }

  const handleToggleMute = () => {
    if (volume === 0) {
      onChange(lastVolume > 0 ? lastVolume : 5)
    } else {
      setLastVolume(volume)
      onChange(0)
    }
  }

  const volumeIcon =
    volume === 0 ? VolumeMute02Icon : volume < 5 ? VolumeLowIcon : Volume02Icon

  return (
    <div
      data-slot="player-volume"
      className={cn("shrink-0", className)}
    >
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="icon"
              variant="outline"
              aria-label="Volume settings"
              className="size-7"
            >
              <HugeiconsIcon
                icon={volumeIcon}
                className="size-3.5"
              />
            </Button>
          }
        />
        <PopoverContent className="w-64">
          <div className="flex items-center gap-2.5 w-full">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 shrink-0"
              onClick={handleToggleMute}
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              <HugeiconsIcon
                icon={volumeIcon}
                className="size-4"
              />
            </Button>

            <NativeSlider
              min={0}
              max={10}
              step={1}
              value={volume}
              onChange={handleChangeVolume}
              className="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export {
  Player,
  PlayerMedia,
  PlayerContent,
  PlayerHeader,
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton,
  PlayerShuffleButton,
  PlayerLoopButton,
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription,
  PlayerProgress,
  PlayerVolume
}
