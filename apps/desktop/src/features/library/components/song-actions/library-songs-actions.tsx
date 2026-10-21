import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TPlaylistSong } from '@/features/playlist-songs/types'
import {
  Delete01Icon,
  FolderIcon,
  FolderTransferIcon,
  MoreHorizontalSquare01Icon,
  PauseIcon,
  PlayIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteSong, MoveSong } from '@/features/playlist-songs/components'
import { CopySongMenuItem } from '@/shared/components/song-actions/copy-song-menu-item'
import { useLibrarySongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'
import { useTranslation } from 'react-i18next'

export interface LibrarySongActionsProps {
  song: TPlaylistSong
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
  actions?: ReturnType<typeof useLibrarySongActions>
}

export function LibrarySongActions(props: LibrarySongActionsProps) {
  if (props.actions) {
    return <LibrarySongActionsControlled {...props} actions={props.actions} />
  }
  return <LibrarySongActionsStandalone {...props} />
}

function LibrarySongActionsControlled({
  song,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
  actions,
}: LibrarySongActionsProps & { actions: ReturnType<typeof useLibrarySongActions> }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const {
    isPlaying,
    setIsDeleteDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
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
              onClick={handleTogglePlayback}
              className='cursor-pointer'
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

            <CopySongMenuItem title={song.name} />

            <DropdownMenuItem
              onClick={handleOpenFolder}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderIcon} />
              <span>{t('playlists.actions.open_folder')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsMoveDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={FolderTransferIcon} />
              <span>{t('playlists.actions.move_to')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant='destructive'
              onClick={() => setIsDeleteDialogOpen(true)}
              className='cursor-pointer'
            >
              <HugeiconsIcon icon={Delete01Icon} />
              <span>{t('playlists.actions.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </Show>
    </DropdownMenu>
  )
}

function LibrarySongActionsStandalone({
  song,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
}: LibrarySongActionsProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const actions = useLibrarySongActions({ song })
  const {
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = actions

  return (
    <>
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
                onClick={handleTogglePlayback}
                className='cursor-pointer'
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

              <CopySongMenuItem title={song.name} />

              <DropdownMenuItem
                onClick={handleOpenFolder}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={FolderIcon} />
                <span>{t('playlists.actions.open_folder')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsMoveDialogOpen(true)}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={FolderTransferIcon} />
                <span>{t('playlists.actions.move_to')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setIsDeleteDialogOpen(true)}
                className='cursor-pointer'
              >
                <HugeiconsIcon icon={Delete01Icon} />
                <span>{t('playlists.actions.delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </Show>
      </DropdownMenu>

      <Show when={isMoveDialogOpen}>
        <MoveSong
          song={song}
          open={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
        />
      </Show>

      <Show when={isDeleteDialogOpen}>
        <DeleteSong
          song={song}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          context='library'
        />
      </Show>
    </>
  )
}
