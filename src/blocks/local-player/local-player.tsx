import { Suspense } from 'react'
import { LocalPlayerCover } from './local-cover'
import { LocalPlayerControls } from './local-controls'
import { LocalPlayerTrackInfo } from './local-track-info'
import { LocalPlayerVolume } from './local-volume'
import { LocalPlayerProgressbar } from './local-progressbar'
import { LocalPlayerTime } from './local-time'
import { LocalPlayerElement } from './local-element'
import { Player } from '@/components/ui/player'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useLocalPlayerStore } from '@/shared/stores/player'
import { useQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'

export function LocalPlayer() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const { data: health } = useQuery(systemHealthQueryOpts())

  if (!currentSong || (health && !health.serverHealthy)) return null

  return (
    <TooltipProvider delay={300}>
      <Player>
        <Suspense>
          <LocalPlayerElement />
        </Suspense>

        <LocalPlayerProgressbar />

        {/* Column 1 (Left): Cover & Track Info side by side */}
        <div className='flex items-center gap-3 min-w-0 overflow-hidden pr-2'>
          <LocalPlayerCover />
          <LocalPlayerTrackInfo />
        </div>

        {/* Column 2 (Center): Playback Controls */}
        <Suspense>
          <LocalPlayerControls />
        </Suspense>

        {/* Column 3 (Right): Time & Volume */}
        <div className='flex items-center justify-end gap-3 min-w-0 pl-2'>
          <LocalPlayerTime />
          <LocalPlayerVolume />
        </div>
      </Player>
    </TooltipProvider>
  )
}
