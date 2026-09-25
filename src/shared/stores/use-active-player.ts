import { create } from "zustand"
import { usePlayerStore } from "@/shared/stores/use-player"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export type ActivePlayerType = "local" | "streaming" | null

interface ActivePlayerStore {
  activePlayer: ActivePlayerType
  activePlaylist: string

  setActivePlayer: (type: ActivePlayerType) => void
  setActivePlaylist: (playlistName: string) => void
  playSong: (song: TPlaylistSong) => void
  playStream: (track: TYoutubeSearchResult) => void
}

export const useActivePlayerStore = create<ActivePlayerStore>((set) => ({
  activePlayer: null,
  activePlaylist: "Default",

  setActivePlayer: (type) => set({ activePlayer: type }),
  setActivePlaylist: (playlistName) => set({ activePlaylist: playlistName }),

  playSong: (song) => {
    // 1. Pause streaming if it was playing
    const streamingState = useStreamingPlayerStore.getState()
    if (streamingState.audioRef) {
      streamingState.setCurrentTrack(null)
      streamingState.pause()
    }

    // 2. Set song in local player store
    usePlayerStore.getState().setCurrentSong(song)

    // 3. Mark active player as local
    set({ activePlayer: "local" })
  },

  playStream: (track) => {
    // 1. Pause local audio if it was playing
    const localState = usePlayerStore.getState()
    if (localState.audioRef) {
      localState.audioRef.pause()
      localState.setCurrentSong(null)
      localState.setPlayerState("paused")
    }

    // 2. Set current track in streaming player store
    useStreamingPlayerStore.getState().setCurrentTrack(track)

    // 3. Mark active player as streaming
    set({ activePlayer: "streaming" })
  }
}))
