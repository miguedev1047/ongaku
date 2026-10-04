import { useRef } from 'react'
import { usePlayerMedia } from '@/blocks/local-player/hooks'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useLocalPlayerStore } from '@/shared/stores/player'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function LocalPlayerElement() {
  const { t } = useTranslation()
  const { songActive, isLoop, handleNextSong, handleTimeUpdate, setAudioRef } =
    usePlayerMedia()
  const { getSongUrl } = useSongUtils()
  const failureCountRef = useRef(0)

  if (!songActive) return null

  const trackUrl = getSongUrl({ song: songActive })

  const handlePlaying = () => {
    failureCountRef.current = 0
  }

  const handleError = () => {
    failureCountRef.current += 1

    if (failureCountRef.current >= 3) {
      toast.error(t('toasts.songs.playback_stopped_multiple'))
      useLocalPlayerStore.getState().setPlayerState('idle')
      failureCountRef.current = 0
      return
    }

    toast.error(t('toasts.songs.cannot_play_song', { name: songActive.name }))
    handleNextSong()
  }

  return (
    <audio
      ref={(el) => setAudioRef(el)}
      key={songActive.id}
      src={trackUrl}
      loop={isLoop}
      controls
      autoPlay
      className='sr-only'
      onPlaying={handlePlaying}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleNextSong}
      onError={handleError}
    />
  )
}
