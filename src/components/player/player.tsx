import {
  NextSongButton,
  PlayerCover,
  PlayerElement,
  PlayerProgressbar,
  PlayerVolume,
  PreviusSongButton,
  ToggleButton
} from "@/components/player"
import { usePlayerStore } from "@/shared/stores/use-player"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

export function Player() {
  const currentSong = usePlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  return (
    <div className="w-full p-4 shrink-0 border-t border-border bg-card">
      <Suspense>
        <PlayerElement />
      </Suspense>

      <div className="flex items-center gap-4 w-full">
        <PlayerCover />

        <div className="flex-1">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Suspense fallback={<Skeleton className="size-8" />}>
                <PreviusSongButton />
              </Suspense>

              <ToggleButton />

              <Suspense fallback={<Skeleton className="size-8" />}>
                <NextSongButton />
              </Suspense>
            </div>

            <PlayerVolume />
          </div>

          <PlayerProgressbar />
        </div>
      </div>
    </div>
  )
}
