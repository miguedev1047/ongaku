import { useEffect } from 'react'
import throttle from 'lodash/throttle'
import { platformService } from '@/infrastructure/platform'
import {
  useLocalPlayerStore,
  useStreamingPlayerStore,
  useActivePlayerStore,
} from '@/features/player/stores'
import { getAdjacentSong } from '@/shared/helpers/get-adjacent-song'
import { getRandomSong } from '@/shared/helpers/get-random-song'

export function usePlayerSync() {
  useEffect(() => {
    let isMounted = true
    const unlistenFns: Array<() => void> = []

    const throttledSetLocalProgress = throttle(
      (currentTime: number) => {
        const state = useLocalPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
        }
      },
      1000,
      { leading: true, trailing: true },
    )

    const throttledSetStreamingProgress = throttle(
      (currentTime: number) => {
        const state = useStreamingPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
          if (state.hasEnded) {
            useStreamingPlayerStore.setState({ hasEnded: false })
          }
        }
      },
      1000,
      { leading: true, trailing: true },
    )

    // 1. Local Player Time Update
    platformService
      .on<{ currentTime: number }>('local-player://time-update', ({ currentTime }) => {
        throttledSetLocalProgress(currentTime)
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 2. Local Player Track Completion & Loop Handling
    platformService
      .on('local-player://ended', () => {
        throttledSetLocalProgress.cancel()
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
        throttledSetStreamingProgress(currentTime)
      })
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 4. Streaming Player Track Completion
    platformService
      .on('streaming-player://ended', () => {
        throttledSetStreamingProgress.cancel()
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
      throttledSetLocalProgress.cancel()
      throttledSetStreamingProgress.cancel()
      for (const fn of unlistenFns) {
        fn()
      }
    }
  }, [])
}
