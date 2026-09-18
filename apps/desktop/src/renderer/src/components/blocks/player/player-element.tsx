import { getSongUrl } from "@renderer/lib/song-utils";
import { usePlayerStore } from "@renderer/utils/stores/use-player";

export function PlayerElement() {
  const trackActive = usePlayerStore((state) => state.currentTrack);
  if (!trackActive) return null;

  const trackUrl = getSongUrl(trackActive.path);

  return (
    <audio
      key={trackActive.id}
      src={trackUrl}
      controls
      autoPlay
      className="sr-only"
    />
  );
}
