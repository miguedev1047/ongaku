import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
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
import { CopySongMenuItem } from '@/components/blocks/song-actions/shared'
import { usePlaylistSongActions } from './hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'

export interface PlaylistSongActionsProps {
  song: TPlaylistSong
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
}

import { useTranslation } from 'react-i18next'

export function PlaylistSongActions({
  song,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
}: PlaylistSongActionsProps) {
  const { t } = useTranslation()
  const {
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder,
  } = usePlaylistSongActions({ song })

  return (
    <>
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
            <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
            <DropdownMenuSeparator />

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
              <span>{t('playlists.actions.remove_from_playlist')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoveSong
        song={song}
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
      />

      <DeleteSong
        song={song}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  )
}
