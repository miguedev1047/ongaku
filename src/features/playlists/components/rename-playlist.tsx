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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import {
  renamePlaylistSchema,
  type TRenamePlaylistSchema
} from "@/shared/schemas/playlists"
import type { TPlaylistAction } from "@/shared/types/playlist-actions"
import type { TPlaylist } from "@/shared/types/playlist.types"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { useEffect } from "react"
import { toast } from "sonner"

interface RenamePlaylistProps {
  playlist: TPlaylist
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenamePlaylist({
  playlist,
  open,
  onOpenChange
}: RenamePlaylistProps) {
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (value: TRenamePlaylistSchema) => {
      const trimmedNewName = value.new_name.trim()
      return await invoke<TPlaylistAction>("rename_playlist", {
        oldName: playlist.name,
        newName: trimmedNewName
      })
    },
    onSuccess: (data, variables) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
      onOpenChange(false)

      const trimmedNewName = variables.new_name.trim()
      navigate({
        to: "/playlists/$playlistName",
        params: { playlistName: trimmedNewName }
      })
    },
    onError: (err) => {
      console.log(err)
      toast.error("An error occurred while renaming the playlist")
    }
  })

  const form = useForm({
    defaultValues: {
      old_name: playlist.name,
      new_name: playlist.name
    },
    validators: {
      onSubmit: renamePlaylistSchema
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    }
  })

  // Reset form with latest playlist name when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        old_name: playlist.name,
        new_name: playlist.name
      })
    }
  }, [open, playlist.name])

  const isPending = mutation.isPending
  const formId = `rename-playlist-form-${playlist.id}`

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename playlist</DialogTitle>
          <DialogDescription>
            Enter a new name for "{playlist.name}".
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="new_name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Playlist Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="New playlist name"
                      autoComplete="off"
                      disabled={isPending}
                    />
                    <FieldDescription>
                      Choose a new name for your playlist
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
          >
            {isPending && <Spinner />}
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
