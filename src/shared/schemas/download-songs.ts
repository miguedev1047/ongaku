import z from 'zod'
import i18n from '@/lib/i18n'

export function createDownloadSongsFormSchema(
  t: (key: string) => string = (k) => i18n.t(k),
) {
  return z.object({
    url: z
      .string()
      .trim()
      .min(1, { error: t('download_songs.form.errors.url_required') })
      .url({ error: t('download_songs.form.errors.url_invalid') }),
  })
}

export const downloadSongsFormSchema = createDownloadSongsFormSchema()
export type TDownloadSongsFormSchema = z.infer<typeof downloadSongsFormSchema>
