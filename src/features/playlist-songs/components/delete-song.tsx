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
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { useDeleteSong } from "@/features/playlist-songs/hooks"
import { Show } from "@/components/utility/show"

interface DeleteSongProps {
  song: TPlaylistSong
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: 'playlist' | 'library'
}

export function DeleteSong({
  song,
  open,
  onOpenChange,
  context = 'playlist',
}: DeleteSongProps) {
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
              fallback={`Remove song "${song.name}"`}
            >
              Delete song "{song.name}"
            </Show>
          </DialogTitle>
          <DialogDescription>
            <Show
              when={isLibrary}
              fallback="Are you sure you want to remove this song from the playlist? The file will remain in your library."
            >
              Are you sure you want to delete this song? This action cannot be
              undone and will permanently remove the audio file from your library.
            </Show>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
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
              fallback="Remove"
            >
              Delete
            </Show>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
