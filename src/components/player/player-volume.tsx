import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Volume02Icon } from "@hugeicons/core-free-icons"
import { usePlayerStore } from "@/shared/stores/use-player"
import { NativeSlider } from "@/components/ui/native-slider"

export function PlayerVolume() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return

    const intValue = parseInt(e.target.value, 10)
    setVolume(intValue)
    audioRef.volume = intValue / 10
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="outline"
          >
            <HugeiconsIcon icon={Volume02Icon} />
          </Button>
        }
      />
      <PopoverContent className="w-80">
        <div className="flex items-center gap-3 w-full">
          <NativeSlider
            min={1}
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
