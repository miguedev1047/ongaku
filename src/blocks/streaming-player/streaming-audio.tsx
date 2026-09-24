import { useEffect } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { youtubeStreamQueryOpts } from "@/shared/queries/youtube-stream"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

interface StreamingAudioProps {
  track: TYoutubeSearchResult
}

export function StreamingAudio({ track }: StreamingAudioProps) {
  const { data: streamUrl } = useSuspenseQuery(youtubeStreamQueryOpts(track.id))

  const setAudioRef = useStreamingPlayerStore((s) => s.setAudioRef)
  const setStreamUrl = useStreamingPlayerStore((s) => s.setStreamUrl)
  const setProgress = useStreamingPlayerStore((s) => s.setProgress)
  const setDuration = useStreamingPlayerStore((s) => s.setDuration)
  const setPlayerState = useStreamingPlayerStore((s) => s.setPlayerState)
  const volume = useStreamingPlayerStore((s) => s.volume)
  const audioRef = useStreamingPlayerStore((s) => s.audioRef)

  useEffect(() => {
    if (streamUrl) {
      setStreamUrl(streamUrl)
    }
  }, [streamUrl, setStreamUrl])

  useEffect(() => {
    if (audioRef) {
      audioRef.volume = volume / 10
      audioRef.muted = volume === 0
    }
  }, [audioRef, volume])

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setProgress(e.currentTarget.currentTime)
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (e.currentTarget.duration) {
      setDuration(e.currentTarget.duration)
    }
    setPlayerState("playing")
  }

  const handleError = () => {
    toast.error("Failed to stream audio from YouTube. The link might have expired.")
    setPlayerState("idle")
  }

  const handleEnded = () => {
    setPlayerState("paused")
    setProgress(0)
  }

  if (!streamUrl) return null

  return (
    <audio
      ref={setAudioRef}
      key={track.id}
      src={streamUrl}
      autoPlay
      controls
      className="sr-only"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={handleError}
      onPlay={() => setPlayerState("playing")}
      onPause={() => {
        if (useStreamingPlayerStore.getState().playerState === "playing") {
          setPlayerState("paused")
        }
      }}
    />
  )
}
