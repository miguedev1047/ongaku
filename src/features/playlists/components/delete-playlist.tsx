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
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TDeletePlaylistSchema } from "@/shared/schemas/playlists"
import type { TPlaylistAction } from "@/shared/types/playlist-actions"
import type { TPlaylist } from "@/shared/types/playlist.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

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
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (value: TDeletePlaylistSchema) => {
      return await invoke<TPlaylistAction>("delete_playlist", {
        name: value.name
      })
    },
    onSuccess: (data) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      navigate({ to: "/playlists" })
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
      onOpenChange(false)
    },
    onError: () => {
      toast.error("An error occurred while deleting the playlist")
    }
  })

  const handleDeletePlaylist = () => {
    mutation.mutate({ name: playlist.name })
  }

  const isPending = mutation.isPending

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
            {isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
