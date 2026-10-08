import { useEffect } from 'react'
import { platformService } from '@/infrastructure/platform'
import {
  useLocalPlayerStore,
  useStreamingPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import { getAdjacentSong } from '@/shared/helpers/get-adjacent-song'
import { getRandomSong } from '@/shared/helpers/get-random-song'

export function usePlayerSync() {
  useEffect(() => {
    let isMounted = true
    const unlistenFns: Array<() => void> = []

    // 1. Local Player Time Update
    platformService
      .on<{ currentTime: number }>('local-player://time-update', ({ currentTime }) => {
        const state = useLocalPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
        }
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 2. Local Player Track Completion & Loop Handling
    platformService
      .on('local-player://ended', () => {
        const { isLoop, currentSong, volume, setProgress, queue, isShuffle } =
          useLocalPlayerStore.getState()

        // Handle loop
        if (isLoop && currentSong) {
          setProgress(0)
          platformService
            .invoke('local_audio_play', {
              path: currentSong.path,
              volume: volume / 100,
              startPosSecs: 0,
            })
            .catch((err) => {
              console.error('Failed to loop track via rodio:', err)
            })
          return
        }

        // Handle track progression
        if (queue && queue.length > 0) {
          const nextSong = isShuffle
            ? getRandomSong(queue, currentSong)
            : getAdjacentSong(queue, currentSong, 1)

          if (nextSong) {
            useActivePlayerStore.getState().playSong(nextSong)
          } else {
            useLocalPlayerStore.getState().setPlayerState('idle')
          }
        } else {
          useLocalPlayerStore.getState().setPlayerState('idle')
        }
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 3. Streaming Player Time Update
    platformService
      .on<{ currentTime: number }>('streaming-player://time-update', ({ currentTime }) => {
        const state = useStreamingPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
          if (state.hasEnded) {
            useStreamingPlayerStore.setState({ hasEnded: false })
          }
        }
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 4. Streaming Player Track Completion
    platformService
      .on('streaming-player://ended', () => {
        const state = useStreamingPlayerStore.getState()
        state.setPlayerState('paused')
        state.setProgress(0)
        useStreamingPlayerStore.setState({ hasEnded: true })
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    return () => {
      isMounted = false
      for (const fn of unlistenFns) {
        fn()
      }
    }
  }, [])
}
