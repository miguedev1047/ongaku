import z from "zod"

export const downloadSongSchema = z.object({
  url: z
    .url({ error: "You put a valid url" })
    .min(1, { error: "The url is required" }),
  playlistName: z.string().min(1, { error: "The playlist is required" })
})

export type TDownloadSongSchema = z.infer<typeof downloadSongSchema>
