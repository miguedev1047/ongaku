import { usePlayerStore } from "@renderer/utils/stores/use-player";
import { PlayerElement } from "@renderer/components/blocks/player/player-element";
import { Suspense } from "react";

export function Player() {
  const trackActive = usePlayerStore((state) => state.currentTrack);

  if (!trackActive) return null;

  return (
    <div className="w-full p-4">
      <Suspense>
        <PlayerElement />
      </Suspense>
    </div>
  );
}
