import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusIcon } from '@hugeicons/core-free-icons'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useNewPlaylist } from '@/features/playlists/hooks'
import { Show } from '@/components/utility/show'
import { cn } from 'cn'

import { useTranslation } from 'react-i18next'

export interface CreatePlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlaylistDialog({
  open,
  onOpenChange,
}: CreatePlaylistDialogProps) {
  const { t } = useTranslation()
  const { form, isPending } = useNewPlaylist({
    onSuccess: () => onOpenChange(false),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('playlists.dialogs.new.title')}</DialogTitle>
          <DialogDescription>
            {t('playlists.dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          id='new-playlist-form'
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name='name'
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('playlists.dialogs.new.field_label')}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={t('playlists.dialogs.new.placeholder')}
                      autoComplete='off'
                      disabled={isPending}
                    />
                    <FieldDescription>
                      {t('playlists.dialogs.new.field_description')}
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
          <DialogClose render={<Button variant='outline'>{t('common.close')}</Button>} />
          <Button
            type='submit'
            form='new-playlist-form'
            disabled={isPending}
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            {t('playlists.dialogs.new.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface NewPlaylistCardProps {
  className?: string
}

export function NewPlaylistCard({ className }: NewPlaylistCardProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  useHotkey('Alt+P', () => setIsOpen((prev) => !prev))

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type='button'
              onClick={() => setIsOpen(true)}
              className={cn(
                'group relative flex min-h-47.5 flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border/60 bg-card/40 hover:bg-accent/40 hover:border-muted-foreground/50 text-muted-foreground hover:text-primary transition-all duration-200 select-none cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0',
                className,
              )}
            >
              <HugeiconsIcon
                icon={PlusIcon}
                className='size-20'
              />
            </button>
          }
        />
        <TooltipContent
          side='bottom'
          className='flex items-center gap-1.5'
        >
          <span>{t('playlists.header.new_button')}</span>
          <KbdGroup>
            <Kbd>Alt</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>

      <CreatePlaylistDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}

/** Alias for backward compatibility */
export const NewPlaylistGrid = NewPlaylistCard
