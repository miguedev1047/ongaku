import { create } from "zustand"
import { persist } from "zustand/middleware"
import { platformService } from "@/infrastructure/platform"
import {
  DEFAULT_PLAYER_VOLUME,
  registerVolumeSubscriber,
  syncPlayerVolume,
} from "./volume-sync"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { LocalPlayerState, PlaybackContext } from "./types"

export interface LocalPlayerStore {
  currentSong: TPlaylistSong | null
  currentPlaylist: string
  playbackContext: PlaybackContext
  queue: readonly TPlaylistSong[]
  isShuffle: boolean
  isLoop: boolean
  isSeeking: boolean
  duration: number
  progress: number
  volume: number
  playerState: LocalPlayerState

  setCurrentSong: (
    song: TPlaylistSong | null,
    queueOrContext?: readonly TPlaylistSong[] | PlaybackContext,
    context?: PlaybackContext
  ) => void
  setQueue: (queue: readonly TPlaylistSong[]) => void
  removeFromQueue: (songId: string) => void
  setCurrentPlaylist: (playlist: string) => void
  setPlaybackContext: (context: PlaybackContext) => void
  setIsShuffle: (isShuffle: boolean) => void
  setIsLoop: (isLoop: boolean) => void
  toggleShuffle: () => void
  toggleLoop: () => void
  setIsSeeking: (isSeeking: boolean) => void
  setDuration: (duration: number) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  setPlayerState: (state: LocalPlayerState) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  seekTo: (time: number) => void
  stop: () => void
  resetPlayer: () => void
}

export const useLocalPlayerStore = create<LocalPlayerStore>()(
  persist(
    (set, get) => ({
  currentSong: null,
  currentPlaylist: "",
  playbackContext: { type: "library" },
  queue: [],
  isLoop: false,
  isShuffle: false,
  playerState: "idle",
  isSeeking: false,
  duration: 0,
  progress: 0,
  volume: DEFAULT_PLAYER_VOLUME,
  setCurrentSong: (song, queueOrContext, context) =>
    set((state) => {
      let resolvedQueue: readonly TPlaylistSong[] | undefined
      let resolvedContext: PlaybackContext | undefined

      if (Array.isArray(queueOrContext)) {
        resolvedQueue = queueOrContext
        resolvedContext = context
      } else if (queueOrContext && typeof queueOrContext === "object" && "type" in queueOrContext) {
        resolvedQueue = undefined
        resolvedContext = queueOrContext
      } else {
        resolvedQueue = undefined
        resolvedContext = context
      }

      const nextContext: PlaybackContext = resolvedContext
        ? resolvedContext
        : song?.playlist_name
          ? { type: "playlist", playlistName: song.playlist_name }
          : state.playbackContext

      const nextPlaylist =
        nextContext.type === "playlist" ? nextContext.playlistName : "Library"

      return {
        currentSong: song,
        queue: resolvedQueue !== undefined ? resolvedQueue : state.queue,
        playbackContext: nextContext,
        currentPlaylist: nextPlaylist,
        duration: song?.metadata.duration ?? 0,
        progress: 0,
        playerState: "playing"
      }
    }),
  setQueue: (queue) => set({ queue }),
  removeFromQueue: (songId) =>
    set((state) => ({
      queue: state.queue.filter((s) => s.id !== songId)
    })),
  setCurrentPlaylist: (playlist) =>
    set({
      currentPlaylist: playlist,
      playbackContext:
        playlist === "Library" || playlist === "library"
          ? { type: "library" }
          : { type: "playlist", playlistName: playlist }
    }),
  setPlaybackContext: (context) =>
    set({
      playbackContext: context,
      currentPlaylist:
        context.type === "playlist" ? context.playlistName : "Library"
    }),
  setIsLoop: (isLoop) =>
    set({
      isLoop,
      ...(isLoop ? { isShuffle: false } : {})
    }),
  setIsShuffle: (isShuffle) =>
    set({
      isShuffle,
      ...(isShuffle ? { isLoop: false } : {})
    }),
  toggleShuffle: () =>
    set((state) => {
      const nextShuffle = !state.isShuffle
      return {
        isShuffle: nextShuffle,
        ...(nextShuffle ? { isLoop: false } : {})
      }
    }),
  toggleLoop: () =>
    set((state) => {
      const nextLoop = !state.isLoop
      return {
        isLoop: nextLoop,
        ...(nextLoop ? { isShuffle: false } : {})
      }
    }),
  setIsSeeking: (isSeeking) => set({ isSeeking }),
  setPlayerState: (state) => set({ playerState: state }),
  setDuration: (duration) => set({ duration }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => {
    syncPlayerVolume(volume)
  },
  play: () => {
    const { playerState, currentSong, volume, progress } = get()
    if (!currentSong) return

    if (playerState === "paused") {
      set({ playerState: "playing" })
      platformService.invoke("local_audio_resume").catch(() => {})
    } else {
      set({ playerState: "playing" })
      const startPos = progress > 0 ? progress : undefined
      platformService
        .invoke("local_audio_play", {
          path: currentSong.path,
          volume: volume / 100,
          startPosSecs: startPos,
        })
        .catch((err) => {
          console.error("Failed to play local audio via rodio:", err)
          set({ playerState: "idle" })
        })
    }
  },
  pause: () => {
    set({ playerState: "paused" })
    platformService.invoke("local_audio_pause").catch(() => {})
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
    const { duration, currentSong } = get()
    if (!currentSong) return
    const max = duration || 0
    const clamped = max > 0 ? Math.min(Math.max(0, time), max) : Math.max(0, time)
    set({ progress: clamped })
    platformService
      .invoke("local_audio_seek", { positionSecs: clamped })
      .catch((err) => {
        console.error("Failed to seek local audio via rodio:", err)
      })
  },
  stop: () => {
    platformService.invoke("local_audio_stop").catch(() => {})
    set({
      playerState: "idle",
      progress: 0,
    })
  },
  resetPlayer: () => {
    platformService.invoke("local_audio_stop").catch(() => {})
    set({
      currentSong: null,
      queue: [],
      progress: 0,
      duration: 0,
      playerState: "idle",
      currentPlaylist: "",
    })
  },
    }),
    {
      name: "ongaku-local-player",
      partialize: (state) => ({
        currentSong: state.currentSong,
        currentPlaylist: state.currentPlaylist,
        playbackContext: state.playbackContext,
        queue: state.queue,
        isLoop: state.isLoop,
        isShuffle: state.isShuffle,
        duration: state.duration,
        progress: state.progress,
        volume: state.volume,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Always ensure initial state is idle and not seeking
        state.setPlayerState("idle")
        state.setIsSeeking(false)

        // If progress is at or beyond the track duration, restart from 0
        if (state.duration > 0 && state.progress >= state.duration - 1) {
          state.setProgress(0)
        }

        // Initialize and sync both players and audio backends with persisted volume
        const initialVol =
          typeof state.volume === "number" && !isNaN(state.volume)
            ? state.volume
            : DEFAULT_PLAYER_VOLUME
        syncPlayerVolume(initialVol)
      },
    },
  ),
)

registerVolumeSubscriber((vol) => {
  if (useLocalPlayerStore.getState().volume !== vol) {
    useLocalPlayerStore.setState({ volume: vol })
  }
})


