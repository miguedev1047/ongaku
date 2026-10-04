import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import type { TPlaylist } from "@/shared/types/playlist.types"
import { useDeletePlaylist } from "@/features/playlists/hooks"
import { Show } from "@/components/utility/show"

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
