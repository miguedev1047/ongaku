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
          <DialogTitle>Delete playlist "{playlist.name}"</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this playlist? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={isPending}
            onClick={handleDeletePlaylist}
            variant="destructive"
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
