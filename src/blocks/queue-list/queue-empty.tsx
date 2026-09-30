import { ListMusicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function QueueEmpty() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center p-6 text-center select-none'>
      <div className='flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-3'>
        <HugeiconsIcon icon={ListMusicIcon} className='size-6' />
      </div>
      <p className='text-xs font-medium text-foreground'>No songs in queue</p>
      <p className='text-[11px] text-muted-foreground mt-1 max-w-[220px]'>
        Play a track from your library or playlists to start filling the queue.
      </p>
    </div>
  )
}
