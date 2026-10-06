import { create } from "zustand"
import { platformService } from "@/infrastructure/platform"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export type StreamingPlayerState = "idle" | "loading" | "playing" | "paused"

interface StreamingPlayerStore {
  currentTrack: TYoutubeSearchResult | null
  playerState: StreamingPlayerState
  isSeeking: boolean
  hasEnded: boolean
  duration: number
  progress: number
  volume: number

  setCurrentTrack: (track: TYoutubeSearchResult | null) => void
  setPlayerState: (state: StreamingPlayerState) => void
  setIsSeeking: (isSeeking: boolean) => void
  setDuration: (duration: number) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  seekTo: (time: number) => void
  stop: () => void
}

export const useStreamingPlayerStore = create<StreamingPlayerStore>(
  (set, get) => ({
    currentTrack: null,
    playerState: "idle",
    isSeeking: false,
    hasEnded: false,
    duration: 0,
    progress: 0,
    volume: 80,

    setCurrentTrack: (track) =>
      set({
        currentTrack: track,
        duration: track?.duration ?? 0,
        progress: 0,
        hasEnded: false,
        playerState: track ? "loading" : "idle",
      }),

    setPlayerState: (state) => set({ playerState: state }),
    setIsSeeking: (isSeeking) => set({ isSeeking }),
    setDuration: (duration) => set({ duration }),
    setProgress: (progress) => set({ progress }),
    setVolume: (volume) => {
      set({ volume })
      platformService
        .invoke("streaming_audio_set_volume", { volume: volume / 100 })
        .catch(() => {})
    },

    play: () => {
      const { playerState, currentTrack, volume, progress, hasEnded } = get()
      if (!currentTrack) return

      // If user paused manually during playback (and track hasn't ended), resume playback
      if (playerState === "paused" && !hasEnded && progress > 0) {
        set({ playerState: "playing" })
        platformService.invoke("streaming_audio_resume").catch(() => {})
      } else {
        // Track ended, was idle, or restart requested: reload and play from start/progress
        set({ playerState: "loading", hasEnded: false })
        const startPos = hasEnded ? 0 : progress > 0 ? progress : undefined
        platformService
          .invoke("streaming_audio_play", {
            videoId: currentTrack.id,
            volume: volume / 100,
            startPosSecs: startPos,
          })
          .then(() => {
            set({ playerState: "playing", hasEnded: false })
          })
          .catch((err) => {
            console.error("Failed to play streaming audio via rodio:", err)
            set({ playerState: "idle", hasEnded: false })
          })
      }
    },

    pause: () => {
      set({ playerState: "paused" })
      platformService.invoke("streaming_audio_pause").catch(() => {})
    },

    togglePlay: () => {
      const { playerState, play, pause } = get()
      if (playerState === "playing") {
        pause()
      } else {
        play()
      }
    },

    seekTo: (time: number) => {
      const { duration, currentTrack, volume, hasEnded } = get()
      const max = duration || 0
      const clamped = max > 0 ? Math.min(Math.max(0, time), max) : Math.max(0, time)
      set({ progress: clamped })

      if (hasEnded && currentTrack) {
        set({ playerState: "loading", hasEnded: false })
        platformService
          .invoke("streaming_audio_play", {
            videoId: currentTrack.id,
            volume: volume / 100,
            startPosSecs: clamped,
          })
          .then(() => {
            set({ playerState: "playing", hasEnded: false })
          })
          .catch(() => {
            set({ playerState: "idle" })
          })
      } else {
        platformService
          .invoke("streaming_audio_seek", { positionSecs: clamped })
          .catch(() => {})
      }
    },

    stop: () => {
      platformService.invoke("streaming_audio_stop").catch(() => {})
      set({
        currentTrack: null,
        playerState: "idle",
        hasEnded: false,
        progress: 0,
        duration: 0,
      })
    },
  })
)

// Platform event listeners for streaming audio
if (typeof window !== "undefined") {
  platformService
    .on("streaming-player://time-update", (payload) => {
      const state = useStreamingPlayerStore.getState()
      if (!state.isSeeking && state.playerState === "playing") {
        state.setProgress(payload.currentTime)
        if (state.hasEnded) {
          useStreamingPlayerStore.setState({ hasEnded: false })
        }
      }
    })
    .catch(() => {})

  platformService
    .on("streaming-player://ended", () => {
      const state = useStreamingPlayerStore.getState()
      state.setPlayerState("paused")
      state.setProgress(0)
      useStreamingPlayerStore.setState({ hasEnded: true })
    })
    .catch(() => {})
}
