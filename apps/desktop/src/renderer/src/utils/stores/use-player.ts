import { PlaylistSong } from "@ongaku/types";
import { create } from "zustand";

type PlayerState = "idle" | "playing" | "paused";

interface PlayerStore {
  currentTrack: PlaylistSong | null;
  currentPlaylist: string | "Default";
  playerState: PlayerState;
  duration: number;
  progress: number;

  setCurrentTrack: (track: PlaylistSong) => void;
  setCurrentPlaylist: (playlist: string) => void;
  setPlayerState: (state: PlayerState) => void;
  setDuration: (duration: number) => void;
  setProgress: (progress: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  currentPlaylist: "Default",
  playerState: "idle",
  duration: 0,
  progress: 0,

  setCurrentTrack: (track) =>
    set({
      currentTrack: track,
      currentPlaylist: track.playlist,
      progress: 0,
      duration: track.duration,
      playerState: "playing",
    }),
  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
  setPlayerState: (state) => set({ playerState: state }),
  setDuration: (duration) => set({ duration }),
  setProgress: (progress) => set({ progress }),
}));
