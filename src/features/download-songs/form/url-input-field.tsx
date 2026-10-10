import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Show } from '@/components/utility/show'
import { FilePasteIcon, Link01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { platformService } from '@/infrastructure/platform'
import { isLinuxPlatform } from '@/shared/helpers/os'

interface UrlInputFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export function UrlInputField({
  value,
  onChange,
  disabled = false,
  error,
}: UrlInputFieldProps) {
  const { t, i18n } = useTranslation()

  const displayError = error
    ? i18n.exists(error)
      ? t(error)
      : error
    : undefined

  const handlePaste = async () => {
    try {
      const text = await platformService.readClipboard()
      if (text.trim()) {
        onChange(text.trim())
      } else {
        toast.info(t('download_songs.form.paste_empty'))
      }
    } catch (err) {
      console.log(err)
      toast.error(t('download_songs.form.paste_error'))
    }
  }

  return (
    <div className='flex flex-col gap-1.5 w-full'>
      <label className='text-xs font-medium text-foreground'>
        {t('download_songs.form.url_label')}
      </label>

      <InputGroup>
        <InputGroupAddon align='inline-start'>
          <HugeiconsIcon
            icon={Link01Icon}
            className='size-3.5 text-muted-foreground'
          />
        </InputGroupAddon>

        <InputGroupInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('download_songs.form.url_placeholder')}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className='text-xs'
        />

        <Show when={!isLinuxPlatform()}>
          <InputGroupAddon align='inline-end'>
            <InputGroupButton
              size='icon-sm'
              variant='ghost'
              onClick={handlePaste}
              disabled={disabled}
            >
              <HugeiconsIcon icon={FilePasteIcon} />
            </InputGroupButton>
          </InputGroupAddon>
        </Show>
      </InputGroup>

      <Show when={Boolean(displayError)}>
        <p className='text-xs text-destructive'>{displayError}</p>
      </Show>
    </div>
  )
}
