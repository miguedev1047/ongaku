import { Suspense, useState } from 'react'
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
import type { TYoutubeSearchResult } from '@/features/youtube-search/types'
import {
  MoreHorizontalSquare01Icon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlaylistMenuGroup } from '@/features/download-queue/components'
import { CopySongMenuItem } from '@/shared/components/song-actions/copy-song-menu-item'
import { useSearchSongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'
import { useTranslation } from 'react-i18next'

export interface SearchSongActionsProps {
  item: TYoutubeSearchResult
  className?: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  showLabel?: boolean
  actions?: ReturnType<typeof useSearchSongActions>
}

export function SearchSongActions(props: SearchSongActionsProps) {
  if (props.actions) {
    return <SearchSongActionsControlled {...props} actions={props.actions} />
  }
  return <SearchSongActionsStandalone {...props} />
}

function SearchSongActionsControlled({
  item,
  className,
  size = 'icon',
  variant = 'outline',
  showLabel = false,
  actions,
}: SearchSongActionsProps & { actions: ReturnType<typeof useSearchSongActions> }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = actions

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
      <Show when={isOpen}>
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
      </Show>
    </DropdownMenu>
  )
}

function SearchSongActionsStandalone({
  item,
  className,
  size = 'icon',
  variant = 'outline',
  showLabel = false,
}: SearchSongActionsProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const actions = useSearchSongActions({ item })
  const {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  } = actions

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
      <Show when={isOpen}>
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
      </Show>
    </DropdownMenu>
  )
}
