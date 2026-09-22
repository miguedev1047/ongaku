import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Volume02Icon,
  VolumeLowIcon,
  VolumeMute02Icon
} from "@hugeicons/core-free-icons"
import { usePlayerStore } from "@/shared/stores/use-player"
import { NativeSlider } from "@/components/ui/native-slider"

export function PlayerVolume() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)

  const [lastVolume, setLastVolume] = useState<number>(volume > 0 ? volume : 5)

  const applyVolume = (val: number) => {
    setVolume(val)
    if (audioRef) {
      audioRef.volume = val / 10
      audioRef.muted = val === 0
    }
  }

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intValue = parseInt(e.target.value, 10)
    if (intValue > 0) {
      setLastVolume(intValue)
    }
    applyVolume(intValue)
  }

  const handleToggleMute = () => {
    if (volume === 0) {
      applyVolume(lastVolume > 0 ? lastVolume : 5)
    } else {
      setLastVolume(volume)
      applyVolume(0)
    }
  }

  const volumeIcon =
    volume === 0 ? VolumeMute02Icon : volume < 5 ? VolumeLowIcon : Volume02Icon

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="outline"
          >
            <HugeiconsIcon icon={volumeIcon} />
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
  )
}
