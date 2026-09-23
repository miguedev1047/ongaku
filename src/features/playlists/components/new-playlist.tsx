import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { PlusIcon } from "@hugeicons/core-free-icons"
import { useForm } from "@tanstack/react-form"
import {
  newPlaylistSchema,
  type TNewPlaylistSchema
} from "@/shared/schemas/playlists"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { toast } from "sonner"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { invoke } from "@tauri-apps/api/core"
import { TPlaylistAction } from "@/shared/types/playlist-actions"
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useHotkey } from "@tanstack/react-hotkeys"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function NewPlaylist() {
  const [isOpen, setIsOpen] = useState(false)

  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (value: TNewPlaylistSchema) => {
      const trimmedPlaylist = value.name.trim()
      return await invoke<TPlaylistAction>("new_playlist", {
        name: trimmedPlaylist
      })
    },
    onSuccess: (data, variables) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      setIsOpen(false)
      form.reset()

      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })

      const trimmedPlaylist = variables.name.trim()
      navigate({
        to: "/playlists/$playlistName",
        params: { playlistName: trimmedPlaylist }
      })
    },
    onError: () => {
      toast.error("An error occurred while creating the playlist")
    }
  })

  const form = useForm({
    defaultValues: {
      name: ""
    },
    validators: {
      onSubmit: newPlaylistSchema
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    }
  })

  const isPending = mutation.isPending

  useHotkey("Alt+P", () => setIsOpen(!isOpen))

  return (
    <Tooltip>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger
          render={
            <TooltipTrigger
              render={
                <Button size="icon">
                  <HugeiconsIcon icon={PlusIcon} />
                </Button>
              }
            />
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add playlist</DialogTitle>
            <DialogDescription>
              Enter a name to create a new playlist.
            </DialogDescription>
          </DialogHeader>

          <form
            id="new-playlist-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Playlist Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Rock Playlist"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      <FieldDescription>
                        Type the playlist name to create it
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
              form="new-playlist-form"
              disabled={isPending}
            >
              {isPending && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipContent>
        New playlist
        <KbdGroup>
          <Kbd>Alt</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  )
}
