import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { UrlInputField } from '@/features/download-songs/form/url-input-field'
import { SubmitDownloadButton } from '@/features/download-songs/form/submit-download-button'
import type { useDownloadSongsForm } from '@/features/download-songs/hooks'

interface DownloadSongsCardFormProps {
  formInstance: ReturnType<typeof useDownloadSongsForm>
}

export function DownloadSongsCardForm({
  formInstance,
}: DownloadSongsCardFormProps) {
  const { t } = useTranslation()
  const { form, isPending, items, clearResults } = formInstance

  const hasResults = items.length > 0

  return (
    <Card className='w-full bg-card/60'>
      <CardHeader className='pb-3'>
        <CardTitle>{t('download_songs.title')}</CardTitle>
        <CardDescription>{t('download_songs.description')}</CardDescription>
      </CardHeader>

      <form
        id='download-song-form'
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <CardContent>
          <form.Field
            name='url'
            children={(field) => (
              <UrlInputField
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isPending}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          />
        </CardContent>

        <CardFooter className='flex items-center justify-between border-t border-border/20 pt-3'>
          <Show
            when={hasResults}
            fallback={<div />}
          >
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isPending}
              onClick={clearResults}
            >
              {t('download_songs.results.clear_results')}
            </Button>
          </Show>

          <SubmitDownloadButton isPending={isPending} />
        </CardFooter>
      </form>
    </Card>
  )
}
