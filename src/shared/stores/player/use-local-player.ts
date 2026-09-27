import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { LocalPlayerState, PlaybackContext } from "./types"

export interface LocalPlayerStore {
  audioRef: HTMLAudioElement | null
  currentSong: TPlaylistSong | null
  currentPlaylist: string | "Default"
  playbackContext: PlaybackContext
  queue: readonly TPlaylistSong[]
  isShuffle: boolean
  isLoop: boolean
  isSeeking: boolean
  duration: number
  progress: number
  volume: number
  playerState: LocalPlayerState

  setAudioRef: (audio: HTMLAudioElement | null) => void
  setCurrentSong: (
    song: TPlaylistSong | null,
    queueOrContext?: readonly TPlaylistSong[] | PlaybackContext,
    context?: PlaybackContext
  ) => void
  setQueue: (queue: readonly TPlaylistSong[]) => void
  removeFromQueue: (songId: string) => void
  setCurrentPlaylist: (playlist: string | "Default") => void
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
}

export const useLocalPlayerStore = create<LocalPlayerStore>((set) => ({
  audioRef: null,
  currentSong: null,
  currentPlaylist: "Default",
  playbackContext: { type: "playlist", playlistName: "Default" },
  queue: [],
  isLoop: false,
  isShuffle: false,
  playerState: "idle",
  isSeeking: false,
  duration: 0,
  progress: 0,
  volume: 80,

  setAudioRef: (ref) => set({ audioRef: ref }),
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
  setVolume: (volume) => set({ volume })
}))
