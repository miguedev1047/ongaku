import { create } from "zustand"
import { platformService } from "@/infrastructure/platform"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export type StreamingPlayerState = "idle" | "loading" | "playing" | "paused"

interface StreamingPlayerStore {
  currentTrack: TYoutubeSearchResult | null
  playerState: StreamingPlayerState
  isSeeking: boolean
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
    duration: 0,
    progress: 0,
    volume: 80,

    setCurrentTrack: (track) =>
      set({
        currentTrack: track,
        duration: track?.duration ?? 0,
        progress: 0,
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
      const { playerState, currentTrack, volume, progress } = get()
      if (!currentTrack) return

      if (playerState === "paused") {
        set({ playerState: "playing" })
        platformService.invoke("streaming_audio_resume").catch(() => {})
      } else {
        set({ playerState: "loading" })
        platformService
          .invoke("streaming_audio_play", {
            videoId: currentTrack.id,
            volume: volume / 100,
            startPosSecs: progress > 0 ? progress : undefined,
          })
          .then(() => {
            set({ playerState: "playing" })
          })
          .catch((err) => {
            console.error("Failed to play streaming audio via rodio:", err)
            set({ playerState: "idle" })
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
      const { duration } = get()
      const max = duration || 0
      const clamped = max > 0 ? Math.min(Math.max(0, time), max) : Math.max(0, time)
      set({ progress: clamped })
      platformService
        .invoke("streaming_audio_seek", { positionSecs: clamped })
        .catch(() => {})
    },

    stop: () => {
      platformService.invoke("streaming_audio_stop").catch(() => {})
      set({
        currentTrack: null,
        playerState: "idle",
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
      }
    })
    .catch(() => {})

  platformService
    .on("streaming-player://ended", () => {
      const state = useStreamingPlayerStore.getState()
      state.setPlayerState("paused")
      state.setProgress(0)
    })
    .catch(() => {})
}
