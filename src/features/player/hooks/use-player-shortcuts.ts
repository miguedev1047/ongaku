import { useHotkey } from "@tanstack/react-hotkeys"
import { useActivePlayerStore } from "@/features/player/stores"
import { isInputTarget } from "@/shared/helpers/is-input-target"

export function usePlayerShortcuts() {
  const togglePlay = useActivePlayerStore((s) => s.togglePlay)
  const seek = useActivePlayerStore((s) => s.seek)
  const changeVolume = useActivePlayerStore((s) => s.changeVolume)
  const toggleMute = useActivePlayerStore((s) => s.toggleMute)

  // Play / Pause (Space)
  useHotkey("[Space]", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    togglePlay()
  })

  // Seek forward 5s (ArrowRight)
  useHotkey("ArrowRight", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    seek(5)
  })

  // Seek backward 5s (ArrowLeft)
  useHotkey("ArrowLeft", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    seek(-5)
  })

  // Volume Up 5% (ArrowUp)
  useHotkey("ArrowUp", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    changeVolume(5)
  })

  // Volume Down 5% (ArrowDown)
  useHotkey("ArrowDown", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    changeVolume(-5)
  })

  // Mute / Unmute (M)
  useHotkey("M", (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    toggleMute()
  })
}
