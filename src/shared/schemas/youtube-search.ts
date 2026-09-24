import { z } from "zod"

export const youtubeSearchSchema = z.object({
  q: z.string().trim()
})

export type TYoutubeSearchSchema = z.infer<typeof youtubeSearchSchema>
