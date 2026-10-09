import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

interface SubmitDownloadButtonProps {
  isPending: boolean
  disabled?: boolean
}

export function SubmitDownloadButton({
  isPending,
  disabled = false,
}: SubmitDownloadButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      type='submit'
      form='download-song-form'
      disabled={disabled || isPending}
    >
      <Show
        when={isPending}
        fallback={
          <div className='flex items-center gap-2'>
            <HugeiconsIcon
              icon={Search01Icon}
              className='size-4'
            />
            <span>{t('download_songs.form.submit')}</span>
          </div>
        }
      >
        <div className='flex items-center gap-2'>
          <Spinner className='size-3.5' />
          <span>{t('download_songs.form.resolving')}</span>
        </div>
      </Show>
    </Button>
  )
}
