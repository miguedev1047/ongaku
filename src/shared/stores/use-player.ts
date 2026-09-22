import { create } from "zustand"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

type PlayerState = "idle" | "playing" | "paused"

interface PlayerStore {
  audioRef: HTMLAudioElement | null
  currentSong: TPlaylistSong | null
  currentPlaylist: string | "Default"
  isSeeking: boolean
  duration: number
  progress: number
  volume: number
  playerState: PlayerState

  setAudioRef: (audio: HTMLAudioElement | null) => void
  setCurrentSong: (song: TPlaylistSong | null) => void
  setCurrentPlaylist: (playlist: string | "Default") => void
  setIsSeeking: (isSeeking: boolean) => void
  setDuration: (duration: number) => void
  setProgress: (progress: number) => void
  setVolume: (volume: number) => void
  setPlayerState: (state: PlayerState) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  audioRef: null,
  currentSong: null,
  currentPlaylist: "Default",
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
  setIsSeeking: (isSeeking) => set({ isSeeking }),
  setPlayerState: (state) => set({ playerState: state }),
  setDuration: (duration) => set({ duration }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume })
}))
