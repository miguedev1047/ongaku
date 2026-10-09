import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { platformService } from '@/infrastructure/platform'
import { useDownloadSongsStore } from '@/shared/stores/actions'
import {
  createDownloadSongsFormSchema,
  type TDownloadSongsFormSchema,
} from '@/shared/schemas/download-songs'

export function useDownloadSongsForm() {
  const { t } = useTranslation()
  const { url, items, setUrl, setItems, clearResults } = useDownloadSongsStore()

  const mutation = useMutation({
    mutationFn: async (values: TDownloadSongsFormSchema) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error(t('download_songs.toasts.offline_blocked'))
      }

      const results = await platformService.invoke('resolve_playlist_info', {
        url: values.url,
      })
      return results
    },
    onSuccess: (data, variables) => {
      setItems(data)
      setUrl(variables.url)
      const count = data.length
      if (count === 1) {
        toast.success(
          t('download_songs.toasts.found_single_track', {
            title: data[0].title,
          }),
        )
      } else {
        toast.success(
          t('download_songs.toasts.found_multiple_tracks', { count }),
        )
      }
    },
    onError: (error: Error) => {
      const message =
        error.message || t('download_songs.toasts.error_resolving')
      toast.error(message)
    },
  })

  const formSchema = useMemo(() => createDownloadSongsFormSchema(t), [t])

  const form = useForm({
    defaultValues: {
      url: url ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    },
  })

  return {
    form,
    isPending: mutation.isPending,
    items,
    clearResults,
  }
}
