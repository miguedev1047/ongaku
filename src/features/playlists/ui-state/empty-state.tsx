import { useState } from 'react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { FolderIcon, PlusIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CreatePlaylistDialog } from '@/features/playlists/components/new-playlist'
import { cn } from 'cn'

export interface PlaylistsEmptyStateProps {
  className?: string
}

export function PlaylistsEmptyState({ className }: PlaylistsEmptyStateProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className={cn(
        'size-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground select-none',
        className
      )}
    >
      <Empty className='py-16'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <HugeiconsIcon icon={FolderIcon} />
          </EmptyMedia>
          <EmptyTitle>No playlists found</EmptyTitle>
          <EmptyDescription>
            Create a new playlist to organize your music library
          </EmptyDescription>
        </EmptyHeader>

        <div className='mt-4 flex justify-center'>
          <Button
            onClick={() => setIsOpen(true)}
            className='gap-2'
          >
            <HugeiconsIcon
              icon={PlusIcon}
              className='size-4'
            />
            <span>Create playlist</span>
          </Button>
        </div>
      </Empty>

      <CreatePlaylistDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  )
}
