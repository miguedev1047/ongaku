import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export type LocalPlayerState = "idle" | "playing" | "paused"

export interface LocalPlayerStore {
  audioRef: HTMLAudioElement | null
  currentSong: TPlaylistSong | null
  currentPlaylist: string | "Default"
  isShuffle: boolean
  isLoop: boolean
  isSeeking: boolean
  duration: number
  progress: number
  volume: number
  playerState: LocalPlayerState

  setAudioRef: (audio: HTMLAudioElement | null) => void
  setCurrentSong: (song: TPlaylistSong | null) => void
  setCurrentPlaylist: (playlist: string | "Default") => void
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
  isLoop: false,
  isShuffle: false,
  playerState: "idle",
  isSeeking: false,
  duration: 0,
  progress: 0,
  volume: 8,

  setAudioRef: (ref) => set({ audioRef: ref }),
  setCurrentSong: (song) =>
    set({
      currentSong: song,
      currentPlaylist: song?.playlist_name,
      duration: song?.metadata.duration ?? 0,
      progress: 0,
      playerState: "playing"
    }),
  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
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
