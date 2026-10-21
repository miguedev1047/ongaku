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
import type { TPlaylist } from "@/features/playlists/types"
import { useDeletePlaylist } from "@/features/playlists/hooks"
import { Show } from "@ongaku/ui"

import { useTranslation } from "react-i18next"

interface DeletePlaylistProps {
  playlist: TPlaylist
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeletePlaylist({
  playlist,
  open,
  onOpenChange
}: DeletePlaylistProps) {
  const { t } = useTranslation()
  const { handleDeletePlaylist, isPending } = useDeletePlaylist({
    playlist,
    onSuccess: () => onOpenChange(false)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('playlists.dialogs.delete.title')}</DialogTitle>
          <DialogDescription>
            {t('playlists.dialogs.delete.description', { name: playlist.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} />
          <Button
            disabled={isPending}
            onClick={handleDeletePlaylist}
            variant="destructive"
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            {t('playlists.dialogs.delete.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
