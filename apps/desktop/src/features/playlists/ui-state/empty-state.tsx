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

import { useTranslation } from 'react-i18next'

export interface PlaylistsEmptyStateProps {
  className?: string
}

export function PlaylistsEmptyState({ className }: PlaylistsEmptyStateProps) {
  const { t } = useTranslation()
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
          <EmptyTitle>{t('playlists.empty.title')}</EmptyTitle>
          <EmptyDescription>
            {t('playlists.empty.description')}
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
            <span>{t('playlists.header.new_button')}</span>
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
