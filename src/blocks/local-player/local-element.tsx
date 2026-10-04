import { useEffect, useRef } from 'react'
import { usePlayerMedia } from '@/blocks/local-player/hooks'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useLocalPlayerStore, useActivePlayerStore } from '@/shared/stores/player'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function LocalPlayerElement() {
  const { t } = useTranslation()
  const { songActive, isLoop, handleNextSong, handleTimeUpdate, setAudioRef } =
    usePlayerMedia()
  const queue = useLocalPlayerStore((state) => state.queue)
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const initialProgress = useLocalPlayerStore((state) => state.progress)
  const { getSongUrl } = useSongUtils()
  const failureCountRef = useRef(0)
  const hasRestoredTimeRef = useRef(false)

  if (!songActive) return null

  const trackUrl = getSongUrl({ song: songActive })

  // Programmatic playback control instead of autoPlay
  useEffect(() => {
    if (!audioRef || !songActive) return

    if (playerState === 'playing') {
      const playPromise = audioRef.play()
      if (playPromise !== undefined) {
        playPromise.catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return
          console.error('Local audio play error:', err)
        })
      }
    } else if (playerState === 'paused' || playerState === 'idle') {
      audioRef.pause()
    }
  }, [audioRef, songActive.id, playerState])

  const handlePlaying = () => {
    failureCountRef.current = 0
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    // If we loaded the app with a persisted song in idle state, restore currentTime
    if (!hasRestoredTimeRef.current && initialProgress > 0) {
      e.currentTarget.currentTime = initialProgress
      hasRestoredTimeRef.current = true
    }
  }

  const handleError = () => {
    failureCountRef.current += 1

    if (failureCountRef.current >= 3) {
      toast.error(t('toasts.songs.playback_stopped_multiple'))
      useActivePlayerStore.getState().resetActivePlayer()
      failureCountRef.current = 0
      return
    }

    toast.error(t('toasts.songs.cannot_play_song', { name: songActive.name }))
    if (queue.length <= 1) {
      useActivePlayerStore.getState().resetActivePlayer()
    } else {
      handleNextSong()
    }
  }

  return (
    <audio
      ref={(el) => setAudioRef(el)}
      key={songActive.id}
      src={trackUrl}
      loop={isLoop}
      controls
      className='sr-only'
      onPlaying={handlePlaying}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleNextSong}
      onError={handleError}
      onPlay={() => {
        if (useLocalPlayerStore.getState().playerState !== 'playing') {
          useLocalPlayerStore.getState().setPlayerState('playing')
        }
      }}
      onPause={() => {
        if (useLocalPlayerStore.getState().playerState === 'playing') {
          useLocalPlayerStore.getState().setPlayerState('paused')
        }
      }}
    />
  )
}
