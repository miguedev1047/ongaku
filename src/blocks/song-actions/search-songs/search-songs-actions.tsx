import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import {
  MoreHorizontalSquare01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlaylistMenuGroup } from '@/features/youtube-search/components'
import { CopySongMenuItem } from '@/blocks/song-actions/shared'
import { useSearchSongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'

export interface SearchSongActionsProps {
  item: TYoutubeSearchResult
  className?: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  showLabel?: boolean
}

import { useTranslation } from 'react-i18next'

export function SearchSongActions({
  item,
  className,
  size = 'icon',
  variant = 'outline',
  showLabel = false,
}: SearchSongActionsProps) {
  const { t } = useTranslation()
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = useSearchSongActions({ item })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={size}
            variant={variant}
            onClick={(e) => e.stopPropagation()}
            aria-label={t('common.actions')}
            className={cn(className)}
          >
            <HugeiconsIcon icon={MoreHorizontalSquare01Icon} />
            <Show when={showLabel}>
              <span>{t('common.actions')}</span>
            </Show>
          </Button>
        }
      />
      <DropdownMenuContent
        align='end'
        className={cn(DROPDOWN_ACTIONS_MENU_WIDTH)}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={togglePlayback}
            className='cursor-pointer'
            disabled={isLoading}
          >
            <Show
              when={isPlaying}
              fallback={
                <>
                  <HugeiconsIcon icon={PlayIcon} />
                  <span>{t('player.play')}</span>
                </>
              }
            >
              <HugeiconsIcon icon={PauseIcon} />
              <span>{t('player.pause')}</span>
            </Show>
          </DropdownMenuItem>

          <CopySongMenuItem title={item.title} />

          <DropdownMenuItem
            onClick={handleOpenYoutube}
            className='cursor-pointer'
          >
            <HugeiconsIcon icon={YoutubeIcon} />
            <span>{t('youtube_search.actions.open_youtube')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='cursor-pointer'>
              <HugeiconsIcon icon={Music01Icon} />
              <span>{t('youtube_search.actions.download_on')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='w-48'>
              <Suspense
                fallback={
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{t('playlists.header.title')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className='p-3 flex items-center justify-center'>
                      <Spinner className='size-4' />
                    </div>
                  </DropdownMenuGroup>
                }
              >
                <PlaylistMenuGroup onSelectPlaylist={handleSelectPlaylist} />
              </Suspense>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
