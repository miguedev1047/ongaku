import { useEffect, useRef } from 'react'
import { useLocalPlayerStore, useActivePlayerStore } from '@/shared/stores/player'
import { usePlayerNextSong } from '@/blocks/local-player/hooks'
import { platformService } from '@/infrastructure/platform'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function LocalPlayerElement() {
  const { t } = useTranslation()
  const songActive = useLocalPlayerStore((state) => state.currentSong)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const volume = useLocalPlayerStore((state) => state.volume)
  const queue = useLocalPlayerStore((state) => state.queue)
  const { handleNextSong } = usePlayerNextSong()

  const lastSongIdRef = useRef<string | null>(null)
  const isLoadedInRustRef = useRef<boolean>(false)
  const lastStateRef = useRef<string>(playerState)
  const consecutiveFailuresRef = useRef<number>(0)

  // 1. Playback lifecycle sync (including persisted track on new session)
  useEffect(() => {
    if (!songActive) {
      if (lastSongIdRef.current !== null || isLoadedInRustRef.current) {
        platformService.invoke('local_audio_stop').catch(() => {})
        lastSongIdRef.current = null
        isLoadedInRustRef.current = false
      }
      return
    }

    const songChanged = lastSongIdRef.current !== songActive.id
    if (songChanged) {
      lastSongIdRef.current = songActive.id
      isLoadedInRustRef.current = false
    }

    if (playerState === 'playing') {
      if (!isLoadedInRustRef.current) {
        // Track is not yet loaded in this Rust session (new track OR persisted track from startup)
        const currentProgress = useLocalPlayerStore.getState().progress
        const startPos = songChanged ? 0 : currentProgress > 0 ? currentProgress : undefined
        platformService
          .invoke('local_audio_play', {
            path: songActive.path,
            volume: volume / 100,
            startPosSecs: startPos,
          })
          .then(() => {
            isLoadedInRustRef.current = true
            consecutiveFailuresRef.current = 0
          })
          .catch((err: unknown) => {
            console.error('Local audio play error via rodio:', err)
            isLoadedInRustRef.current = false
            useLocalPlayerStore.getState().setPlayerState('idle')

            let errorCode = 'Unknown'
            if (typeof err === 'object' && err !== null && 'code' in err) {
              errorCode = (err as { code: string }).code
            }

            if (errorCode === 'NotFound') {
              toast.error(t('toasts.songs.song_file_not_found', { name: songActive.name }))
            } else if (errorCode === 'DecodeError') {
              toast.error(t('toasts.songs.song_decode_error', { name: songActive.name }))
            } else if (errorCode === 'PermissionDenied') {
              toast.error(t('toasts.songs.song_permission_denied', { name: songActive.name }))
            } else if (errorCode === 'DeviceError') {
              toast.error(t('toasts.songs.audio_device_error'))
            } else {
              toast.error(t('toasts.songs.cannot_play_song', { name: songActive.name }))
            }

            consecutiveFailuresRef.current += 1
            const currentQueue = useLocalPlayerStore.getState().queue
            const remainingInQueue = currentQueue.filter((s) => s.id !== songActive.id)

            // Remove faulty song from queue to prevent retrying it
            useLocalPlayerStore.getState().removeFromQueue(songActive.id)

            if (consecutiveFailuresRef.current >= 3 || remainingInQueue.length === 0) {
              consecutiveFailuresRef.current = 0
              if (remainingInQueue.length === 0) {
                useActivePlayerStore.getState().resetActivePlayer()
              } else {
                toast.error(t('toasts.songs.playback_stopped_multiple'))
                useLocalPlayerStore.getState().setPlayerState('idle')
              }
            } else {
              handleNextSong()
            }
          })
      } else if (lastStateRef.current !== 'playing') {
        // Already loaded into Rust, resume playback
        platformService.invoke('local_audio_resume').catch(() => {})
      }
    } else if (playerState === 'paused') {
      if (isLoadedInRustRef.current && lastStateRef.current !== 'paused') {
        platformService.invoke('local_audio_pause').catch(() => {})
      }
    }

    lastStateRef.current = playerState
  }, [songActive, playerState, volume, queue.length, handleNextSong, t])

  // 2. Position updates from Rust ticker with safe HMR unlisten
  useEffect(() => {
    let isMounted = true
    let unlisten: (() => void) | undefined

    platformService
      .on('local-player://time-update', ({ currentTime }) => {
        const { isSeeking, setProgress } = useLocalPlayerStore.getState()
        if (!isSeeking) {
          setProgress(currentTime)
        }
      })
      .then((fn) => {
        if (!isMounted) {
          fn()
        } else {
          unlisten = fn
        }
      })

    return () => {
      isMounted = false
      unlisten?.()
    }
  }, [])

  // 3. Natural track completion and Loop handling with safe HMR unlisten
  useEffect(() => {
    let isMounted = true
    let unlisten: (() => void) | undefined

    platformService
      .on('local-player://ended', () => {
        const { isLoop, currentSong, volume, setProgress } = useLocalPlayerStore.getState()
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

        handleNextSong()
      })
      .then((fn) => {
        if (!isMounted) {
          fn()
        } else {
          unlisten = fn
        }
      })

    return () => {
      isMounted = false
      unlisten?.()
    }
  }, [handleNextSong])

  return null
}
