import { Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { PlaylistMenuGroup } from '@/features/download-queue/components'
import { useSearchBatchActions } from '@/components/blocks/search-songs-list/hooks'
import { useActivePlayerStore } from '@/shared/stores/player'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Download01Icon } from '@hugeicons/core-free-icons'

import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { Show } from '@/components/utility/show'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'

export function SearchBatchBar() {
  const { t } = useTranslation()
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  const { selectedCount, clearSelection, handleBatchDownload } =
    useSearchBatchActions()

  if (selectedCount === 0) {
    return null
  }

  const bottomClass = activePlayer ? 'bottom-24' : 'bottom-6'

  return createPortal(
    <div
      className={cn(
        `fixed left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-lg px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`,
        bottomClass,
      )}
    >
      <div className='flex items-center gap-2'>
        <span className='text-xs font-semibold text-foreground'>
          <Show
            when={selectedCount === 1}
            fallback={t('playlists.batch.selected_plural', {
              count: selectedCount,
            })}
          >
            {t('playlists.batch.selected', { count: selectedCount })}
          </Show>
        </span>

        <Button
          size='icon-sm'
          variant='ghost-muted'
          onClick={clearSelection}
          title={t('playlists.batch.deselect_all')}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            className='size-3.5'
          />
        </Button>
      </div>

      <div className='h-4 w-px bg-border/60' />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size='sm'
              className='gap-1.5 h-8'
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className='size-3.5'
              />
              <span>{t('youtube_search.download_to')}</span>
            </Button>
          }
        />
        <DropdownMenuContent
          align='center'
          className={cn(DROPDOWN_ACTIONS_MENU_WIDTH)}
        >
          <Suspense
            fallback={
              <div className='p-3 flex items-center justify-center'>
                <Spinner className='size-4' />
              </div>
            }
          >
            <PlaylistMenuGroup onSelectPlaylist={handleBatchDownload} />
          </Suspense>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>,
    document.body,
  )
}
