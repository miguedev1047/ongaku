import { NativeSlider } from "@/components/ui/native-slider"
import { usePlayerProgressbar } from "@/hooks/use-player-controls"
import { formatDuration } from "@/shared/helpers/format-duration"

export function PlayerProgressbar() {
  const { duration, progress, handlePointerDown, handlePointerUp, handleSeek } =
    usePlayerProgressbar()

  return (
    <div className="w-full">
      <NativeSlider
        min={0}
        max={duration}
        value={progress}
        onChange={handleSeek}
        onPointerUp={handlePointerUp}
        onPointerDown={handlePointerDown}
        className="w-full"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p>{formatDuration(progress)}</p>
        <p>{formatDuration(duration)}</p>
      </div>
    </div>
  )
}
