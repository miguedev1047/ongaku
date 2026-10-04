import { create } from 'zustand'
import { useLocalPlayerStore } from './use-local-player'
import { useStreamingPlayerStore } from './use-streaming-player'
import type { PlaybackContext, ActivePlayerType } from './types'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'

interface ActivePlayerStore {
  activePlayer: ActivePlayerType
  activePlaylist: string
  lastNonZeroVolume: number

  setActivePlayer: (type: ActivePlayerType) => void
  setActivePlaylist: (playlistName: string) => void
  playSong: (
    song: TPlaylistSong,
    queueOrContext?: readonly TPlaylistSong[] | PlaybackContext,
    context?: PlaybackContext,
  ) => void
  playStream: (track: TYoutubeSearchResult) => void

  // Universal Player Controls
  togglePlay: () => void
  seek: (deltaSeconds: number) => void
  changeVolume: (delta: number) => void
  toggleMute: () => void
  resetActivePlayer: () => void
}

export const useActivePlayerStore = create<ActivePlayerStore>((set, get) => ({
  activePlayer: null,
  activePlaylist: '',
  lastNonZeroVolume: 80,

  setActivePlayer: (type) => set({ activePlayer: type }),
  setActivePlaylist: (playlistName) => set({ activePlaylist: playlistName }),

  playSong: (song, queueOrContext, context) => {
    // 1. Pause streaming if it was playing
    const streamingState = useStreamingPlayerStore.getState()
    if (streamingState.audioRef) {
      streamingState.setCurrentTrack(null)
      streamingState.pause()
    }

    // 2. Resolve queue and context
    let resolvedQueue: readonly TPlaylistSong[] | undefined
    let resolvedContext: PlaybackContext | undefined

    if (Array.isArray(queueOrContext)) {
      resolvedQueue = queueOrContext
      resolvedContext = context
    } else if (
      queueOrContext &&
      typeof queueOrContext === 'object' &&
      'type' in queueOrContext
    ) {
      resolvedQueue = undefined
      resolvedContext = queueOrContext
    } else {
      resolvedQueue = undefined
      resolvedContext = context
    }

    // 3. Set song in local player store with context and queue
    useLocalPlayerStore
      .getState()
      .setCurrentSong(song, resolvedQueue, resolvedContext)

    // 4. Mark active player as local and record active playlist / source
    const nextPlaylist =
      resolvedContext?.type === 'playlist'
        ? resolvedContext.playlistName
        : resolvedContext?.type === 'library'
          ? 'Library'
          : song?.playlist_name || ''

    set({ activePlayer: 'local', activePlaylist: nextPlaylist })
  },

  playStream: (track) => {
    // 1. Pause local audio if it was playing
    const localState = useLocalPlayerStore.getState()
    if (localState.audioRef) {
      localState.audioRef.pause()
      localState.setCurrentSong(null)
      localState.setPlayerState('paused')
    }

    // 2. Set current track in streaming player store
    useStreamingPlayerStore.getState().setCurrentTrack(track)

    // 3. Mark active player as streaming
    set({ activePlayer: 'streaming' })
  },

  togglePlay: () => {
    const { activePlayer } = get()
    if (activePlayer === 'local') {
      const localState = useLocalPlayerStore.getState()
      const audioRef = localState.audioRef
      if (!audioRef || !localState.currentSong) return

      if (localState.playerState === 'playing') {
        localState.setPlayerState('paused')
        audioRef.pause()
      } else {
        localState.setPlayerState('playing')
        audioRef.play().catch(() => {})
      }
    } else if (activePlayer === 'streaming') {
      useStreamingPlayerStore.getState().togglePlay()
    }
  },

  seek: (deltaSeconds: number) => {
    const { activePlayer } = get()
    if (activePlayer === 'local') {
      const localState = useLocalPlayerStore.getState()
      const audioRef = localState.audioRef
      if (!audioRef) return
      const duration = localState.duration || audioRef.duration || 0
      const target = Math.max(
        0,
        Math.min(duration, audioRef.currentTime + deltaSeconds),
      )
      audioRef.currentTime = target
      localState.setProgress(target)
    } else if (activePlayer === 'streaming') {
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
    const newVol = Math.max(0, Math.min(100, currentVol + delta))

    useLocalPlayerStore.getState().setVolume(newVol)
    useStreamingPlayerStore.getState().setVolume(newVol)

    if (newVol > 0) {
      set({ lastNonZeroVolume: newVol })
    }

    if (localState.audioRef) {
      localState.audioRef.volume = newVol / 100
      localState.audioRef.muted = newVol === 0
    }

    const streamingState = useStreamingPlayerStore.getState()
    if (streamingState.audioRef) {
      streamingState.audioRef.volume = newVol / 100
      streamingState.audioRef.muted = newVol === 0
    }
  },

  toggleMute: () => {
    const currentVol = useLocalPlayerStore.getState().volume
    if (currentVol > 0) {
      set({ lastNonZeroVolume: currentVol })
      get().changeVolume(-currentVol)
    } else {
      const restore = get().lastNonZeroVolume || 80
      get().changeVolume(restore)
    }
  },

  resetActivePlayer: () => {
    useLocalPlayerStore.getState().resetPlayer()
    useStreamingPlayerStore.getState().stop()
    set({ activePlayer: null, activePlaylist: '' })
  },
}))
