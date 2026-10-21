import { create } from 'zustand'
import { platformService } from '@/infrastructure/platform'
import { useLocalPlayerStore } from './use-local-player'
import { useStreamingPlayerStore } from './use-streaming-player'
import {
  DEFAULT_PLAYER_VOLUME,
  registerVolumeSubscriber,
  syncPlayerVolume,
} from './volume-sync'
import type {
  PlaybackContext,
  ActivePlayerType,
} from './types'
import type { TPlaylistSong } from '@/features/playlist-songs/types'
import type { TYoutubeSearchResult } from '@/features/youtube-search/types'

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
  setVolume: (volume: number) => void
  toggleMute: () => void
  resetActivePlayer: () => void
}

let localSeekTimeout: ReturnType<typeof setTimeout> | null = null
let streamingSeekTimeout: ReturnType<typeof setTimeout> | null = null

export const useActivePlayerStore = create<ActivePlayerStore>((set, get) => {
  const localInitialState = useLocalPlayerStore.getState()
  const initialActivePlayer = localInitialState.currentSong ? 'local' : null
  const initialActivePlaylist =
    localInitialState.currentPlaylist ||
    (localInitialState.playbackContext.type === 'playlist'
      ? localInitialState.playbackContext.playlistName
      : '')

  return {
    activePlayer: initialActivePlayer,
    activePlaylist: initialActivePlaylist,
    lastNonZeroVolume: localInitialState.volume || DEFAULT_PLAYER_VOLUME,

    setActivePlayer: (type) => set({ activePlayer: type }),
    setActivePlaylist: (playlistName) => set({ activePlaylist: playlistName }),

    playSong: (song, queueOrContext, context) => {
      // 1. Stop streaming playback immediately
      useStreamingPlayerStore.getState().stop()

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
      const localStore = useLocalPlayerStore.getState()
      localStore.setCurrentSong(song, resolvedQueue, resolvedContext)
      localStore.setProgress(0)

      // 4. Mark active player as local and record active playlist / source
      const nextPlaylist =
        resolvedContext?.type === 'playlist'
          ? resolvedContext.playlistName
          : resolvedContext?.type === 'library'
            ? 'Library'
            : song?.playlist_name || ''

      set({ activePlayer: 'local', activePlaylist: nextPlaylist })

      // 5. Start playback via Rodio
      platformService
        .invoke('local_audio_play', {
          path: song.path,
          volume: localStore.volume / 100,
          startPosSecs: 0,
        })
        .catch((err) => {
          console.error('Failed to play local audio:', err)
        })
    },

    playStream: (track) => {
      // 1. Stop local Rodio playback immediately
      useLocalPlayerStore.getState().setPlayerState('paused')
      useLocalPlayerStore.getState().setProgress(0)
      platformService.invoke('local_audio_stop').catch(() => {})

      // 2. Set current track in streaming player store and trigger play
      const streamingStore = useStreamingPlayerStore.getState()
      streamingStore.setCurrentTrack(track)
      streamingStore.setProgress(0)
      streamingStore.play()

      // 3. Mark active player as streaming
      set({ activePlayer: 'streaming' })
    },

    togglePlay: () => {
      const { activePlayer } = get()
      if (activePlayer === 'local') {
        useLocalPlayerStore.getState().togglePlay()
      } else if (activePlayer === 'streaming') {
        useStreamingPlayerStore.getState().togglePlay()
      }
    },

    seek: (deltaSeconds: number) => {
      const { activePlayer } = get()
      if (activePlayer === 'local') {
        const localState = useLocalPlayerStore.getState()
        if (!localState.currentSong) return
        const duration = localState.duration || 0
        const current = localState.progress
        const target = Math.max(
          0,
          duration > 0
            ? Math.min(duration, current + deltaSeconds)
            : current + deltaSeconds,
        )
        if (localSeekTimeout) clearTimeout(localSeekTimeout)
        localState.setIsSeeking(true)
        localState.setProgress(target)
        platformService
          .invoke('local_audio_seek', { positionSecs: target })
          .catch((err) => {
            console.error('Failed to seek local audio via rodio:', err)
          })
        localSeekTimeout = setTimeout(() => {
          useLocalPlayerStore.getState().setIsSeeking(false)
          localSeekTimeout = null
        }, 400)
      } else if (activePlayer === 'streaming') {
        const streamingState = useStreamingPlayerStore.getState()
        if (!streamingState.currentTrack) return
        const duration = streamingState.duration || 0
        const current = streamingState.progress
        const target = Math.max(
          0,
          duration > 0
            ? Math.min(duration, current + deltaSeconds)
            : current + deltaSeconds,
        )
        if (streamingSeekTimeout) clearTimeout(streamingSeekTimeout)
        streamingState.setIsSeeking(true)
        streamingState.seekTo(target)
        streamingSeekTimeout = setTimeout(() => {
          useStreamingPlayerStore.getState().setIsSeeking(false)
          streamingSeekTimeout = null
        }, 400)
      }
    },

    changeVolume: (delta: number) => {
      const currentVol = useLocalPlayerStore.getState().volume
      const newVol = Math.max(0, Math.min(100, currentVol + delta))
      syncPlayerVolume(newVol)
    },

    setVolume: (volume: number) => {
      syncPlayerVolume(volume)
    },

    toggleMute: () => {
      const currentVol = useLocalPlayerStore.getState().volume
      if (currentVol > 0) {
        set({ lastNonZeroVolume: currentVol })
        get().changeVolume(-currentVol)
      } else {
        const restore = get().lastNonZeroVolume || DEFAULT_PLAYER_VOLUME
        get().changeVolume(restore)
      }
    },

    resetActivePlayer: () => {
      useLocalPlayerStore.getState().resetPlayer()
      useStreamingPlayerStore.getState().stop()
      set({ activePlayer: null, activePlaylist: '' })
    },
  }
})

registerVolumeSubscriber((vol) => {
  if (vol > 0) {
    useActivePlayerStore.setState({ lastNonZeroVolume: vol })
  }
})

