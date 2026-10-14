import z from 'zod'
import i18n from '@/lib/i18n'

function getPlaylistNameSchema(t: (key: string) => string = (k) => i18n.t(k)) {
  return z
    .string()
    .trim()
    .min(1, { error: t('playlists.errors.name_required') })
    .max(100, { error: t('playlists.errors.name_max') })
    .regex(/^[^<>:"/\\|?*]+$/, {
      error: t('playlists.errors.name_invalid_chars'),
    })
    .refine((val) => !val.endsWith('.') && !val.endsWith(' '), {
      error: t('playlists.errors.name_invalid_ending'),
    })
}

export function createNewPlaylistSchema(
  t: (key: string) => string = (k) => i18n.t(k),
) {
  return z.object({
    name: getPlaylistNameSchema(t),
  })
}

export const newPlaylistSchema = createNewPlaylistSchema()
export type TNewPlaylistSchema = z.infer<typeof newPlaylistSchema>

export function createRenamePlaylistSchema(
  t: (key: string) => string = (k) => i18n.t(k),
) {
  return z.object({
    old_name: getPlaylistNameSchema(t),
    new_name: getPlaylistNameSchema(t),
  })
}

export const renamePlaylistSchema = createRenamePlaylistSchema()
export type TRenamePlaylistSchema = z.infer<typeof renamePlaylistSchema>

export function createDeletePlaylistSchema(
  t: (key: string) => string = (k) => i18n.t(k),
) {
  return z.object({
    name: getPlaylistNameSchema(t),
  })
}

export const deletePlaylistSchema = createDeletePlaylistSchema()
export type TDeletePlaylistSchema = z.infer<typeof deletePlaylistSchema>
