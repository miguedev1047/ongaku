import { create } from "zustand"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export type StreamingPlayerState = "idle" | "loading" | "playing" | "paused"

interface StreamingPlayerStore {
  audioRef: HTMLAudioElement | null
  currentTrack: TYoutubeSearchResult | null
  streamUrl: string | null
  playerState: StreamingPlayerState
  isSeeking: boolean
  duration: number
  progress: number
  volume: number

  setAudioRef: (audio: HTMLAudioElement | null) => void
  setCurrentTrack: (track: TYoutubeSearchResult | null) => void
  setStreamUrl: (url: string | null) => void
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

export const useStreamingPlayerStore = create<StreamingPlayerStore>((set, get) => ({
  audioRef: null,
  currentTrack: null,
  streamUrl: null,
  playerState: "idle",
  isSeeking: false,
  duration: 0,
  progress: 0,
  volume: 8,

  setAudioRef: (ref) => set({ audioRef: ref }),
  setCurrentTrack: (track) =>
    set({
      currentTrack: track,
      streamUrl: null,
      duration: track?.duration ?? 0,
      progress: 0,
      playerState: track ? "loading" : "idle"
    }),
  setStreamUrl: (url) => set({ streamUrl: url }),
  setPlayerState: (state) => set({ playerState: state }),
  setIsSeeking: (isSeeking) => set({ isSeeking }),
  setDuration: (duration) => set({ duration }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),

  play: () => {
    const { audioRef } = get()
    if (!audioRef) return
    audioRef
      .play()
      .then(() => set({ playerState: "playing" }))
      .catch(() => {})
  },

  pause: () => {
    const { audioRef } = get()
    if (!audioRef) return
    audioRef.pause()
    set({ playerState: "paused" })
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
    const { audioRef, duration } = get()
    if (!audioRef) return
    const max = duration || audioRef.duration || 0
    const clamped = max > 0 ? Math.min(Math.max(0, time), max) : Math.max(0, time)
    audioRef.currentTime = clamped
    set({ progress: clamped })
  },

  stop: () => {
    const { audioRef } = get()
    if (audioRef) {
      audioRef.pause()
      audioRef.currentTime = 0
    }
    set({
      currentTrack: null,
      streamUrl: null,
      playerState: "idle",
      progress: 0,
      duration: 0
    })
  }
}))
