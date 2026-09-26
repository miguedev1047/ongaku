import { create } from "zustand"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export type ActivePlayerType = "local" | "streaming" | null

interface ActivePlayerStore {
  activePlayer: ActivePlayerType
  activePlaylist: string
  lastNonZeroVolume: number

  setActivePlayer: (type: ActivePlayerType) => void
  setActivePlaylist: (playlistName: string) => void
  playSong: (song: TPlaylistSong) => void
  playStream: (track: TYoutubeSearchResult) => void

  // Universal Player Controls
  togglePlay: () => void
  seek: (deltaSeconds: number) => void
  changeVolume: (delta: number) => void
  toggleMute: () => void
}

export const useActivePlayerStore = create<ActivePlayerStore>((set, get) => ({
  activePlayer: null,
  activePlaylist: "Default",
  lastNonZeroVolume: 8,

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
    useLocalPlayerStore.getState().setCurrentSong(song)

    // 3. Mark active player as local
    set({ activePlayer: "local" })
  },

  playStream: (track) => {
    // 1. Pause local audio if it was playing
    const localState = useLocalPlayerStore.getState()
    if (localState.audioRef) {
      localState.audioRef.pause()
      localState.setCurrentSong(null)
      localState.setPlayerState("paused")
    }

    // 2. Set current track in streaming player store
    useStreamingPlayerStore.getState().setCurrentTrack(track)

    // 3. Mark active player as streaming
    set({ activePlayer: "streaming" })
  },

  togglePlay: () => {
    const { activePlayer } = get()
    if (activePlayer === "local") {
      const localState = useLocalPlayerStore.getState()
      const audioRef = localState.audioRef
      if (!audioRef || !localState.currentSong) return

      if (localState.playerState === "playing") {
        localState.setPlayerState("paused")
        audioRef.pause()
      } else {
        localState.setPlayerState("playing")
        audioRef.play().catch(() => {})
      }
    } else if (activePlayer === "streaming") {
      useStreamingPlayerStore.getState().togglePlay()
    }
  },

  seek: (deltaSeconds: number) => {
    const { activePlayer } = get()
    if (activePlayer === "local") {
      const localState = useLocalPlayerStore.getState()
      const audioRef = localState.audioRef
      if (!audioRef) return
      const duration = localState.duration || audioRef.duration || 0
      const target = Math.max(
        0,
        Math.min(duration, audioRef.currentTime + deltaSeconds)
      )
      audioRef.currentTime = target
      localState.setProgress(target)
    } else if (activePlayer === "streaming") {
      const streamingState = useStreamingPlayerStore.getState()
      const audioRef = streamingState.audioRef
      if (!audioRef) return
      const current = audioRef.currentTime
      streamingState.seekTo(current + deltaSeconds)
    }
  },

  changeVolume: (delta: number) => {
    const localState = useLocalPlayerStore.getState()
    const currentVol = localState.volume
    const newVol = Math.max(0, Math.min(10, currentVol + delta))

    useLocalPlayerStore.getState().setVolume(newVol)
    useStreamingPlayerStore.getState().setVolume(newVol)

    if (newVol > 0) {
      set({ lastNonZeroVolume: newVol })
    }

    if (localState.audioRef) {
      localState.audioRef.volume = newVol / 10
      localState.audioRef.muted = newVol === 0
    }

    const streamingState = useStreamingPlayerStore.getState()
    if (streamingState.audioRef) {
      streamingState.audioRef.volume = newVol / 10
      streamingState.audioRef.muted = newVol === 0
    }
  },

  toggleMute: () => {
    const currentVol = useLocalPlayerStore.getState().volume
    if (currentVol > 0) {
      set({ lastNonZeroVolume: currentVol })
      get().changeVolume(-currentVol)
    } else {
      const restore = get().lastNonZeroVolume || 8
      get().changeVolume(restore)
    }
  }
}))
