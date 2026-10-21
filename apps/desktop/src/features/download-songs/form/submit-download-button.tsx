import { RainbowButton } from '@ongaku/ui'
import { Spinner } from '@ongaku/ui'
import { Show } from '@ongaku/ui'
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
    <RainbowButton
      type='submit'
      form='download-song-form'
      disabled={disabled || isPending}
    >
      <Show
        when={isPending}
        fallback={
          <>
            <HugeiconsIcon icon={Search01Icon} className='size-4' />
            <span>{t('download_songs.form.submit')}</span>
          </>
        }
      >
        <>
          <Spinner className='size-3.5' />
          <span>{t('download_songs.form.resolving')}</span>
        </>
      </Show>
    </RainbowButton>
  )
}
