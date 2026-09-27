import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusIcon } from "@hugeicons/core-free-icons"
import { useHotkey } from "@tanstack/react-hotkeys"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useNewPlaylist } from "@/features/playlists/hooks"

interface NewPlaylistProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function NewPlaylist({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  showTrigger = true
}: NewPlaylistProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen
  const setIsOpen = (next: boolean) => {
    if (isControlled) {
      setExternalOpen?.(next)
    } else {
      setInternalOpen(next)
    }
  }

  const { form, isPending } = useNewPlaylist({
    onSuccess: () => setIsOpen(false)
  })

  useHotkey("Alt+P", () => setIsOpen(!isOpen))

  const dialogContent = (
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
                  <FieldLabel htmlFor={field.name}>Playlist Name</FieldLabel>
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
  )

  if (!showTrigger) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        {dialogContent}
      </Dialog>
    )
  }

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
        {dialogContent}
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
