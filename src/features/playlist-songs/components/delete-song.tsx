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

interface DeleteSongProps {
  song: TPlaylistSong
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSong({ song, open, onOpenChange }: DeleteSongProps) {
  const { handleDeleteSong, isPending } = useDeleteSong({
    song,
    onSuccess: () => onOpenChange(false)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete song "{song.name}"</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this song? This action cannot be
            undone and will remove the file from your computer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={isPending}
            onClick={handleDeleteSong}
            variant="destructive"
          >
            {isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
