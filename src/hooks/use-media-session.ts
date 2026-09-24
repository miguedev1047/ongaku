import { useEffect } from "react"
import { usePlayerStore } from "@/shared/stores/use-player"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { useSongUtils } from "@/hooks/use-song-utils"
import { usePlaybackActions } from "@/hooks/use-playback-actions"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"

export function useMediaSession() {
  const activePlayer = useActivePlayerStore((state) => state.activePlayer)
  const isStreaming = activePlayer === "streaming"

  const currentSong = usePlayerStore((state) => state.currentSong)
  const localPlayerState = usePlayerStore((state) => state.playerState)
  const localDuration = usePlayerStore((state) => state.duration)
  const localProgress = usePlayerStore((state) => state.progress)

  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const streamingPlayerState = useStreamingPlayerStore((state) => state.playerState)
  const streamingDuration = useStreamingPlayerStore((state) => state.duration)
  const streamingProgress = useStreamingPlayerStore((state) => state.progress)

  const { getCoverUrl } = useSongUtils()
  const { play, pause, nextTrack, prevTrack, seekTo } = usePlaybackActions()

  // Metadata
  useEffect(() => {
    if (!("mediaSession" in navigator)) return

    if (isStreaming && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.channel || "YouTube",
        album: "YouTube",
        artwork: currentTrack.thumbnail
          ? [
              {
                src: currentTrack.thumbnail,
                sizes: "512x512",
                type: "image/jpeg"
              }
            ]
          : []
      })
      return
    }

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
  }, [isStreaming, currentTrack, currentSong, getCoverUrl])

  // Playback state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return

    const activeState = isStreaming ? streamingPlayerState : localPlayerState

    if (activeState === "playing") {
      navigator.mediaSession.playbackState = "playing"
    } else if (activeState === "paused") {
      navigator.mediaSession.playbackState = "paused"
    } else {
      navigator.mediaSession.playbackState = "none"
    }
  }, [isStreaming, streamingPlayerState, localPlayerState])

  // Position state
  useEffect(() => {
    if (
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession)
    )
      return

    const duration = isStreaming ? streamingDuration : localDuration
    const progress = isStreaming ? streamingProgress : localProgress

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
  }, [isStreaming, streamingDuration, streamingProgress, localDuration, localProgress])

  // Action handlers
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

    if (isStreaming) {
      const { play: streamPlay, pause: streamPause, seekTo: streamSeekTo } =
        useStreamingPlayerStore.getState()

      setHandler("play", () => streamPlay())
      setHandler("pause", () => streamPause())
      setHandler("stop", () => streamPause())
      setHandler("nexttrack", null)
      setHandler("previoustrack", null)
      setHandler("seekto", (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          streamSeekTo(details.seekTime)
        }
      })
      setHandler("seekbackward", (details) => {
        const skipTime = details.seekOffset || 10
        const current = useStreamingPlayerStore.getState().progress
        streamSeekTo(current - skipTime)
      })
      setHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 10
        const current = useStreamingPlayerStore.getState().progress
        streamSeekTo(current + skipTime)
      })
    } else {
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
        const current = usePlayerStore.getState().progress
        seekTo(current - skipTime)
      })
      setHandler("seekforward", (details) => {
        const skipTime = details.seekOffset || 5
        const current = usePlayerStore.getState().progress
        seekTo(current + skipTime)
      })
    }

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
  }, [isStreaming, play, pause, nextTrack, prevTrack, seekTo])
}
