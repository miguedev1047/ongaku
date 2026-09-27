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
import type { TPlaylist } from "@/shared/types/playlist.types"
import { useRenamePlaylist } from "@/features/playlists/hooks"
import { Show } from "@/components/utility/show"

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
  const { form, isPending } = useRenamePlaylist({
    playlist,
    open,
    onSuccess: () => onOpenChange(false)
  })

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
                    <Show when={isInvalid}>
                      <FieldError errors={field.state.meta.errors} />
                    </Show>
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
            <Show when={isPending}>
              <Spinner />
            </Show>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
