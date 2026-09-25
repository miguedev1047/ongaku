import { usePlayerMedia } from "@/blocks/local-player/hooks"
import { useSongUtils } from "@/hooks/use-song-utils"

export function LocalPlayerElement() {
  const { songActive, isLoop, handleNextSong, handleTimeUpdate, setAudioRef } =
    usePlayerMedia()
  const { getSongUrl } = useSongUtils()

  if (!songActive) return null

  const trackUrl = getSongUrl({ song: songActive })

  return (
    <audio
      ref={(el) => setAudioRef(el)}
      key={songActive.id}
      src={trackUrl}
      loop={isLoop}
      controls
      autoPlay
      className="sr-only"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleNextSong}
    />
  )
}
