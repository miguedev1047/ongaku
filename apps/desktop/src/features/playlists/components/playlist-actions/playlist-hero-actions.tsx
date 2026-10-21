import { Button } from '@ongaku/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ongaku/ui'
import {
  Delete01Icon,
  ImportIcon,
  MoreHorizontalSquare01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { Show } from '@ongaku/ui'
import { DeletePlaylist } from '@/features/playlists/components'
import { usePlaylistActions } from '@/features/playlists/components/playlist-actions/hooks'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@ongaku/ui'

export interface PlaylistActionsProps {
  playlistName?: string
  size?: 'default' | 'sm' | 'icon'
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  showLabel?: boolean
}

import { useTranslation } from 'react-i18next'

export function PlaylistHeroActions({
  playlistName,
  size = 'icon',
  variant = 'outline',
  className,
  showLabel = false,
}: PlaylistActionsProps) {
  const { t } = useTranslation()
  const {
    playlist,
    isImporting,
    isDeleteOpen,
    setIsDeleteOpen,
    handleImportSongs,
  } = usePlaylistActions({ playlistName })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size={size}
              variant={variant}
              onClick={(e) => e.stopPropagation()}
              disabled={isImporting}
              aria-label={t('common.actions')}
              className={cn('cursor-pointer', className)}
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
              onClick={handleImportSongs}
              className={cn('cursor-pointer')}
            >
              <HugeiconsIcon icon={ImportIcon} />
              <span>{t('playlists.actions.import_songs')}</span>
            </DropdownMenuItem>

            <Show when={playlist}>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                onClick={() => setIsDeleteOpen(true)}
                className={cn('cursor-pointer')}
              >
                <HugeiconsIcon icon={Delete01Icon} />
                <span>{t('playlists.actions.delete')}</span>
              </DropdownMenuItem>
            </Show>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Show when={isDeleteOpen && playlist}>
        {(p) => (
          <DeletePlaylist
            playlist={p}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        )}
      </Show>
    </>
  )
}
