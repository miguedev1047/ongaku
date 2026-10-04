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

import { useTranslation } from "react-i18next"

export function RenamePlaylist({
  playlist,
  open,
  onOpenChange
}: RenamePlaylistProps) {
  const { t } = useTranslation()
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
          <DialogTitle>{t('playlists.dialogs.rename.title')}</DialogTitle>
          <DialogDescription>
            {t('playlists.dialogs.rename.description')}
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
                    <FieldLabel htmlFor={field.name}>
                      {t('playlists.dialogs.rename.field_label')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={t('playlists.dialogs.rename.placeholder')}
                      autoComplete="off"
                      disabled={isPending}
                    />
                    <FieldDescription>
                      {t('playlists.dialogs.rename.field_description')}
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
          <DialogClose render={<Button variant="outline">{t('common.close')}</Button>} />
          <Button
            type="submit"
            form={formId}
            disabled={isPending}
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            {t('playlists.dialogs.rename.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
