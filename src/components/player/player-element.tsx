import { usePlayerMedia } from "@/hooks/use-player-media"
import { getSongUrl } from "@/lib/song-utils"

export function PlayerElement() {
  const { songActive, handleNextSong, handleTimeUpdate, setAudioRef } =
    usePlayerMedia()

  if (!songActive) return null

  const trackUrl = getSongUrl({ song: songActive })

  return (
    <audio
      ref={(el) => setAudioRef(el)}
      key={songActive.id}
      src={trackUrl}
      controls
      autoPlay
      className="sr-only"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleNextSong}
    />
  )
}
