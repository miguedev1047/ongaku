import { Button } from "@ongaku/ui"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@ongaku/ui"
import { Spinner } from "@ongaku/ui"
import type { TPlaylistSong } from "@/features/playlist-songs/types"
import { useDeleteSong } from "@/features/playlist-songs/hooks"
import { Show } from "@ongaku/ui"

interface DeleteSongProps {
  song: TPlaylistSong
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: 'playlist' | 'library'
}

import { useTranslation } from "react-i18next"

export function DeleteSong(props: DeleteSongProps) {
  if (!props.open) return null
  return <DeleteSongContent {...props} />
}

function DeleteSongContent({
  song,
  open,
  onOpenChange,
  context = 'playlist',
}: DeleteSongProps) {
  const { t } = useTranslation()
  const { handleDeleteSong, isPending } = useDeleteSong({
    song,
    context,
    onSuccess: () => onOpenChange(false),
  })

  const isLibrary = context === 'library'

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <Show
              when={isLibrary}
              fallback={t('playlists.dialogs.delete_song.title_playlist', { name: song.name })}
            >
              {t('playlists.dialogs.delete_song.title_library', { name: song.name })}
            </Show>
          </DialogTitle>
          <DialogDescription>
            <Show
              when={isLibrary}
              fallback={t('playlists.dialogs.delete_song.desc_playlist')}
            >
              {t('playlists.dialogs.delete_song.desc_library')}
            </Show>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} />
          <Button
            disabled={isPending}
            onClick={handleDeleteSong}
            variant="destructive"
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            <Show
              when={isLibrary}
              fallback={t('playlists.dialogs.delete_song.action_playlist')}
            >
              {t('playlists.dialogs.delete_song.action_library')}
            </Show>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
