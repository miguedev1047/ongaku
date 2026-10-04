import * as React from "react"
import { useTranslation } from "react-i18next"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NativeSlider } from "@/components/ui/native-slider"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
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

interface PlayerProps extends React.ComponentProps<"div"> {
  position?: "bottom" | "top"
}

function Player({ className, position = "bottom", ...props }: PlayerProps) {
  return (
    <div
      data-slot="player"
      className={cn(
        "relative w-full h-16 px-4 shrink-0 bg-card/95 backdrop-blur grid grid-cols-[1fr_auto_1fr] items-center gap-2 z-30 select-none",
        position === "top" ? "border-b border-border" : "border-t border-border",
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
        "relative size-11 rounded-md overflow-hidden shrink-0 bg-muted flex items-center justify-center border border-border/50 shadow-xs",
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
      className={cn("contents", className)}
      {...props}
    />
  )
}

function PlayerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-header"
      className={cn("contents", className)}
      {...props}
    />
  )
}

function PlayerControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-controls"
      className={cn(
        "flex items-center justify-center gap-1.5 shrink-0",
        className
      )}
      {...props}
    />
  )
}

function PlayerTrackInfo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="player-track-info"
      className={cn("flex flex-col min-w-0 flex-1 overflow-hidden", className)}
      {...props}
    />
  )
}

function PlayerTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="player-title"
      className={cn(
        "text-xs font-semibold line-clamp-1 break-all leading-tight text-foreground",
        className
      )}
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
        "text-[11px] text-muted-foreground line-clamp-1 break-all leading-tight mt-0.5",
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
  tooltip?: string
  shortcut?: React.ReactNode
}

function PlayerPlayButton({
  isPlaying,
  isLoading,
  tooltip,
  shortcut,
  className,
  ...props
}: PlayerPlayButtonProps) {
  const { t } = useTranslation()
  const label = tooltip ?? (isPlaying ? t("player.pause") : t("player.play"))
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="player-play-button"
            size="icon"
            variant="default"
            className={cn("size-9 rounded-md shadow-xs", className)}
            aria-label={label}
            disabled={isLoading || props.disabled}
            {...props}
          >
            {isLoading ? (
              <Spinner className="size-4" />
            ) : (
              <HugeiconsIcon
                icon={isPlaying ? PauseIcon : PlayIcon}
                className="size-4"
              />
            )}
          </Button>
        }
      />
      <TooltipContent>
        <span>{label}</span>
        {shortcut !== undefined ? shortcut : <Kbd>Space</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

interface PlayerPreviousButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  tooltip?: string
  shortcut?: React.ReactNode
}

function PlayerPreviousButton({
  tooltip,
  shortcut,
  className,
  ...props
}: PlayerPreviousButtonProps) {
  const { t } = useTranslation()
  const label = tooltip ?? t("player.previous_track")
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="player-previous-button"
            size="icon"
            variant="ghost"
            className={cn(
              "size-8 rounded-md text-muted-foreground hover:text-foreground",
              className
            )}
            aria-label={label}
            {...props}
          >
            <HugeiconsIcon
              icon={SkipBack}
              className="size-4"
            />
          </Button>
        }
      />
      <TooltipContent>
        <span>{label}</span>
        {shortcut !== undefined ? shortcut : <Kbd>P</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

interface PlayerNextButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  tooltip?: string
  shortcut?: React.ReactNode
}

function PlayerNextButton({
  tooltip,
  shortcut,
  className,
  ...props
}: PlayerNextButtonProps) {
  const { t } = useTranslation()
  const label = tooltip ?? t("player.next_track")
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="player-next-button"
            size="icon"
            variant="ghost"
            className={cn(
              "size-8 rounded-md text-muted-foreground hover:text-foreground",
              className
            )}
            aria-label={label}
            {...props}
          >
            <HugeiconsIcon
              icon={SkipForward}
              className="size-4"
            />
          </Button>
        }
      />
      <TooltipContent>
        <span>{label}</span>
        {shortcut !== undefined ? shortcut : <Kbd>N</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

interface PlayerShuffleButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  isShuffle?: boolean
  tooltip?: string
  shortcut?: React.ReactNode
}

function PlayerShuffleButton({
  isShuffle,
  tooltip,
  shortcut,
  className,
  ...props
}: PlayerShuffleButtonProps) {
  const { t } = useTranslation()
  const label = tooltip ?? (isShuffle ? t("player.shuffle_disable") : t("player.shuffle"))
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="player-shuffle-button"
            size="icon"
            variant="ghost"
            className={cn(
              "size-8 rounded-md text-muted-foreground hover:text-foreground",
              isShuffle && "text-primary hover:text-primary bg-primary/10",
              className
            )}
            aria-label={label}
            {...props}
          >
            <HugeiconsIcon
              icon={ShuffleIcon}
              className="size-4"
            />
          </Button>
        }
      />
      <TooltipContent>
        <span>{label}</span>
        {shortcut !== undefined ? shortcut : <Kbd>S</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

interface PlayerLoopButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  isLoop?: boolean
  tooltip?: string
  shortcut?: React.ReactNode
}

function PlayerLoopButton({
  isLoop,
  tooltip,
  shortcut,
  className,
  ...props
}: PlayerLoopButtonProps) {
  const { t } = useTranslation()
  const label = tooltip ?? (isLoop ? t("player.repeat_disable") : t("player.repeat"))
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-slot="player-loop-button"
            size="icon"
            variant="ghost"
            className={cn(
              "size-8 rounded-md text-muted-foreground hover:text-foreground",
              isLoop && "text-primary hover:text-primary bg-primary/10",
              className
            )}
            aria-label={label}
            {...props}
          >
            <HugeiconsIcon
              icon={RepeatIcon}
              className="size-4"
            />
          </Button>
        }
      />
      <TooltipContent>
        <span>{label}</span>
        {shortcut !== undefined ? shortcut : <Kbd>R</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

interface PlayerProgressProps {
  progress: number
  duration: number
  disabled?: boolean
  onSeek?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  className?: string
  position?: "bottom" | "top"
}

function PlayerProgress({
  progress,
  duration,
  disabled = false,
  onSeek,
  onPointerDown,
  onPointerUp,
  className,
  position = "bottom"
}: PlayerProgressProps) {
  const { t } = useTranslation()
  return (
    <div
      data-slot="player-progress"
      className={cn(
        "absolute left-0 right-0 z-30 h-1.5 flex items-center",
        position === "top" ? "-bottom-0.75" : "-top-0.75",
        className
      )}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <div className="w-full h-full flex items-center">
              <NativeSlider
                min={0}
                max={duration || 0}
                value={progress}
                onChange={onSeek}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                disabled={disabled}
                className="w-full h-full cursor-pointer rounded-none"
              />
            </div>
          }
        />
        <TooltipContent>
          <span>{t("player.seek")}</span>
          <KbdGroup>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

interface PlayerTimeProps extends React.ComponentProps<"div"> {
  progress: number
  duration: number
}

function PlayerTime({
  progress,
  duration,
  className,
  ...props
}: PlayerTimeProps) {
  return (
    <div
      data-slot="player-time"
      className={cn(
        "text-xs font-mono text-muted-foreground tabular-nums select-none shrink-0",
        className
      )}
      {...props}
    >
      {formatDuration(progress)} / {formatDuration(duration)}
    </div>
  )
}

interface PlayerVolumeProps {
  volume: number
  onChange: (val: number) => void
  className?: string
  position?: "bottom" | "top"
}

function PlayerVolume({
  volume,
  onChange,
  className,
  position = "bottom"
}: PlayerVolumeProps) {
  const { t } = useTranslation()
  const [lastVolume, setLastVolume] = React.useState<number>(
    volume > 0 ? volume : 80
  )
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [displayVolume, setDisplayVolume] = React.useState<number>(volume)
  const rafRef = React.useRef<number | null>(null)
  const isDraggingRef = React.useRef(false)

  React.useEffect(() => {
    if (!isDraggingRef.current) {
      setDisplayVolume(volume)
      if (volume > 0) {
        setLastVolume(volume)
      }
    }
  }, [volume])

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const handleToggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (displayVolume === 0) {
      const target = lastVolume > 0 ? lastVolume : 80
      setDisplayVolume(target)
      onChange(target)
    } else {
      setLastVolume(displayVolume)
      setDisplayVolume(0)
      onChange(0)
    }
  }

  const handleValueChange = (val: number | readonly number[]) => {
    const num = Math.round(Array.isArray(val) ? val[0] : val)
    isDraggingRef.current = true
    setDisplayVolume(num)
    if (num > 0) {
      setLastVolume(num)
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      onChange(num)
      rafRef.current = null
    })
  }

  const handleValueCommitted = (val: number | readonly number[]) => {
    const num = Math.round(Array.isArray(val) ? val[0] : val)
    isDraggingRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setDisplayVolume(num)
    if (num > 0) {
      setLastVolume(num)
    }
    onChange(num)
  }

  const volumeIcon =
    displayVolume === 0
      ? VolumeMute02Icon
      : displayVolume < 50
        ? VolumeLowIcon
        : Volume02Icon

  return (
    <div
      data-slot="player-volume"
      className={cn("shrink-0", className)}
    >
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <Tooltip open={popoverOpen ? false : undefined}>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={t("player.volume_settings")}
                    className="size-8 rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={volumeIcon}
                      className="size-4"
                    />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>
            <span>{t("player.volume")}</span>
            <KbdGroup>
              <Kbd>M</Kbd>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          side={position === "top" ? "bottom" : "top"}
          align="center"
          sideOffset={12}
          className="w-10 px-2 h-70 gap-1 flex flex-col items-center justify-between rounded-lg bg-popover/95 backdrop-blur border border-border shadow-lg"
        >
          <span className="text-[10px] font-mono font-medium text-muted-foreground select-none">
            {displayVolume}%
          </span>

          <div className="flex-1 w-full flex items-center justify-center py-2">
            <Slider
              orientation="vertical"
              min={0}
              max={100}
              step={1}
              value={[displayVolume]}
              onValueChange={handleValueChange}
              onValueCommitted={handleValueCommitted}
              className="h-full"
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground shrink-0"
            onClick={handleToggleMute}
            aria-label={displayVolume === 0 ? t("player.unmute") : t("player.mute")}
          >
            <HugeiconsIcon
              icon={volumeIcon}
              className="size-4"
            />
          </Button>
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
  PlayerTime,
  PlayerVolume
}
