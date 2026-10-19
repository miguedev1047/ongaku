import { useEffect } from 'react'
import { Throttler } from '@tanstack/pacer'
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

    const localThrottler = new Throttler(
      (currentTime: number) => {
        const state = useLocalPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
        }
      },
      { wait: 1000, leading: true, trailing: true },
    )

    const streamingThrottler = new Throttler(
      (currentTime: number) => {
        const state = useStreamingPlayerStore.getState()
        if (!state.isSeeking && state.playerState === 'playing') {
          state.setProgress(currentTime)
          if (state.hasEnded) {
            useStreamingPlayerStore.setState({ hasEnded: false })
          }
        }
      },
      { wait: 1000, leading: true, trailing: true },
    )

    let lastLocalSongChangeTime =
      useLocalPlayerStore.getState().trackChangeTimestamp || Date.now()
    let lastStreamingTrackChangeTime =
      useStreamingPlayerStore.getState().trackChangeTimestamp || Date.now()

    const unsubLocalStore = useLocalPlayerStore.subscribe(
      (state, prevState) => {
        if (
          state.trackChangeTimestamp !== prevState.trackChangeTimestamp ||
          state.currentSong?.id !== prevState.currentSong?.id
        ) {
          lastLocalSongChangeTime = Date.now()
          localThrottler.cancel()
          state.setProgress(0)
        }
      },
    )
    unlistenFns.push(unsubLocalStore)

    const unsubStreamingStore = useStreamingPlayerStore.subscribe(
      (state, prevState) => {
        if (
          state.trackChangeTimestamp !== prevState.trackChangeTimestamp ||
          state.currentTrack?.id !== prevState.currentTrack?.id
        ) {
          lastStreamingTrackChangeTime = Date.now()
          streamingThrottler.cancel()
          state.setProgress(0)
        }
      },
    )
    unlistenFns.push(unsubStreamingStore)

    // 1. Local Player Time Update
    platformService
      .on<{ currentTime: number }>(
        'local-player://time-update',
        ({ currentTime }) => {
          const state = useLocalPlayerStore.getState()

          // Discard in-flight stale ticks from old playback during track change
          if (Date.now() - lastLocalSongChangeTime < 1000 && currentTime > 1.5) {
            localThrottler.cancel()
            return
          }

          if (state.isSeeking) {
            localThrottler.cancel()
            return
          }

          localThrottler.maybeExecute(currentTime)
        },
      )
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 2. Local Player Track Completion & Loop Handling
    platformService
      .on('local-player://ended', () => {
        lastLocalSongChangeTime = Date.now()
        localThrottler.cancel()
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
          useLocalPlayerStore.getState().setDirection(1)
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
      .on<{ currentTime: number }>(
        'streaming-player://time-update',
        ({ currentTime }) => {
          const state = useStreamingPlayerStore.getState()

          // Discard in-flight stale ticks from old playback during track change
          if (
            Date.now() - lastStreamingTrackChangeTime < 1000 &&
            currentTime > 1.5
          ) {
            streamingThrottler.cancel()
            return
          }

          if (state.isSeeking) {
            streamingThrottler.cancel()
            return
          }

          streamingThrottler.maybeExecute(currentTime)
        },
      )
      .then((fn) => {
        if (!isMounted) fn()
        else unlistenFns.push(fn)
      })
      .catch(() => {})

    // 4. Streaming Player Track Completion
    platformService
      .on('streaming-player://ended', () => {
        lastStreamingTrackChangeTime = Date.now()
        streamingThrottler.cancel()
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
      localThrottler.cancel()
      streamingThrottler.cancel()
      for (const fn of unlistenFns) {
        fn()
      }
    }
  }, [])
}
