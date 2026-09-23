import { useEffect } from "react"
import { usePlayerStore } from "@/shared/stores/use-player"
import { useSongUtils } from "@/hooks/use-song-utils"
import { usePlaybackActions } from "@/hooks/use-playback-actions"

export function useMediaSession() {
  const currentSong = usePlayerStore((state) => state.currentSong)
  const playerState = usePlayerStore((state) => state.playerState)
  const duration = usePlayerStore((state) => state.duration)
  const progress = usePlayerStore((state) => state.progress)

  const { getCoverUrl } = useSongUtils()
  const { play, pause, nextTrack, prevTrack, seekTo } = usePlaybackActions()

  useEffect(() => {
    if (!("mediaSession" in navigator)) return

    if (!currentSong) {
      navigator.mediaSession.metadata = null
      return
    }

    const coverUrl = getCoverUrl({ song: currentSong })

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.name,
      artist: currentSong.metadata?.artist || "Unknown Artist",
      album:
        currentSong.metadata?.album || currentSong.playlist_name || "Ongaku",
      artwork: coverUrl
        ? [
            {
              src: coverUrl,
              sizes: "256x256",
              type: "image/jpeg"
            }
          ]
        : []
    })
  }, [currentSong, getCoverUrl])

  useEffect(() => {
    if (!("mediaSession" in navigator)) return

    if (playerState === "playing") {
      navigator.mediaSession.playbackState = "playing"
    } else if (playerState === "paused") {
      navigator.mediaSession.playbackState = "paused"
    } else {
      navigator.mediaSession.playbackState = "none"
    }
  }, [playerState])

  useEffect(() => {
    if (
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    )
      return

    if (
      duration > 0 &&
      Number.isFinite(duration) &&
      Number.isFinite(progress)
    ) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: 1.0,
          position: Math.min(Math.max(0, progress), duration)
        })
      } catch {}
    }
  }, [duration, progress])

  useEffect(() => {
    if (!("mediaSession" in navigator)) return

    const setHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {}
    }

    setHandler("play", () => play())
    setHandler("pause", () => pause())
    setHandler("stop", () => pause())
    setHandler("nexttrack", () => nextTrack())
    setHandler("previoustrack", () => prevTrack())
    setHandler("seekto", (details) => {
      if (details.seekTime !== undefined && details.seekTime !== null) {
        seekTo(details.seekTime)
      }
    })
    setHandler("seekbackward", (details) => {
      const skipTime = details.seekOffset || 5
      const currentProgress = usePlayerStore.getState().progress
      seekTo(currentProgress - skipTime)
    })
    setHandler("seekforward", (details) => {
      const skipTime = details.seekOffset || 5
      const currentProgress = usePlayerStore.getState().progress
      seekTo(currentProgress + skipTime)
    })

    return () => {
      setHandler("play", null)
      setHandler("pause", null)
      setHandler("stop", null)
      setHandler("nexttrack", null)
      setHandler("previoustrack", null)
      setHandler("seekto", null)
      setHandler("seekbackward", null)
      setHandler("seekforward", null)
    }
  }, [play, pause, nextTrack, prevTrack, seekTo])
}
