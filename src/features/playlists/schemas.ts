import z from "zod"

export const newPlaylistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "The playlist name is required" })
    .max(100, { error: "The playlist name cannot exceed 100 characters" })
    .regex(/^[^<>:"/\\|?*]+$/, {
      error:
        'The playlist name cannot contain invalid characters: < > : " / \\ | ? *'
    })
    .refine((val) => !val.endsWith(".") && !val.endsWith(" "), {
      error: "The playlist name cannot end with a dot or space"
    })
})
export type TNewPlaylistSchema = z.infer<typeof newPlaylistSchema>

export const renamePlaylistSchema = z.object({
  old_name: z
    .string()
    .trim()
    .min(1, { error: "The playlist name is required" })
    .max(100, { error: "The playlist name cannot exceed 100 characters" })
    .regex(/^[^<>:"/\\|?*]+$/, {
      error:
        'The playlist name cannot contain invalid characters: < > : " / \\ | ? *'
    })
    .refine((val) => !val.endsWith(".") && !val.endsWith(" "), {
      error: "The playlist name cannot end with a dot or space"
    }),
  new_name: z
    .string()
    .trim()
    .min(1, { error: "The playlist name is required" })
    .max(100, { error: "The playlist name cannot exceed 100 characters" })
    .regex(/^[^<>:"/\\|?*]+$/, {
      error:
        'The playlist name cannot contain invalid characters: < > : " / \\ | ? *'
    })
    .refine((val) => !val.endsWith(".") && !val.endsWith(" "), {
      error: "The playlist name cannot end with a dot or space"
    })
})
export type TRenamePlaylistSchema = z.infer<typeof renamePlaylistSchema>

export const deletePlaylistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "The playlist name is required" })
    .max(100, { error: "The playlist name cannot exceed 100 characters" })
    .regex(/^[^<>:"/\\|?*]+$/, {
      error:
        'The playlist name cannot contain invalid characters: < > : " / \\ | ? *'
    })
    .refine((val) => !val.endsWith(".") && !val.endsWith(" "), {
      error: "The playlist name cannot end with a dot or space"
    })
})
export type TDeletePlaylistSchema = z.infer<typeof deletePlaylistSchema>
