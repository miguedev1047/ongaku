import { useHotkey } from "@tanstack/react-hotkeys"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"

export function usePlayerShortcuts() {
  const togglePlay = useActivePlayerStore((s) => s.togglePlay)
  const seek = useActivePlayerStore((s) => s.seek)
  const changeVolume = useActivePlayerStore((s) => s.changeVolume)
  const toggleMute = useActivePlayerStore((s) => s.toggleMute)

  // Play / Pause (Space)
  useHotkey("[Space]", (e) => {
    e.preventDefault()
    togglePlay()
  })

  // Seek forward 5s (ArrowRight)
  useHotkey("ArrowRight", (e) => {
    e.preventDefault()
    seek(5)
  })

  // Seek backward 5s (ArrowLeft)
  useHotkey("ArrowLeft", (e) => {
    e.preventDefault()
    seek(-5)
  })

  // Volume Up 10% (ArrowUp)
  useHotkey("ArrowUp", (e) => {
    e.preventDefault()
    changeVolume(1)
  })

  // Volume Down 10% (ArrowDown)
  useHotkey("ArrowDown", (e) => {
    e.preventDefault()
    changeVolume(-1)
  })

  // Mute / Unmute (M)
  useHotkey("M", (e) => {
    e.preventDefault()
    toggleMute()
  })
}
