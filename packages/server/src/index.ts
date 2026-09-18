import sharp from "sharp"

import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { SERVER_PORT } from "@ongaku/constants/server"
import { zValidator } from "@hono/zod-validator"
import { serveStatic } from "@hono/node-server/serve-static"
import { z } from "zod"
import { isInsideDir } from "./helpers"
import { join, relative, resolve } from "node:path"
import { CACHE_PICTURES_DIR, PLAYLIST_DIR } from "@ongaku/constants/paths"
import { parseFile } from "music-metadata"
import { existsSync } from "node:fs"
import { ensureDir } from "fs-extra"

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/

export function initServer() {
  const app = new Hono()

  app
    .get("/", (c) => {
      return c.text("Hello Hono!")
    })
    .get(
      "/api/song-stream",
      zValidator(
        "query",
        z.object({
          path: z
            .string({ error: "This a must a string" })
            .min(1, { error: "The path is required" })
        })
      ),
      async (c) => {
        const { path } = c.req.valid("query")
        const resolvedPath = resolve(path)

        if (!isInsideDir(resolvedPath, PLAYLIST_DIR)) {
          return c.text("Forbidden", 403)
        }

        if (!existsSync(resolvedPath)) {
          return c.text("Song not found", 404)
        }

        const middleware = serveStatic({
          root: relative(process.cwd(), PLAYLIST_DIR),
          path: relative(PLAYLIST_DIR, resolvedPath)
        })

        const file = await middleware(c, async () => {})
        return file ?? c.notFound()
      }
    )
    .get(
      "/api/song-cover",
      zValidator(
        "query",
        z.object({
          path: z.string().min(1),
          id: z.string().regex(SAFE_ID_REGEX)
        })
      ),
      async (c) => {
        await ensureDir(CACHE_PICTURES_DIR)

        const { path, id } = c.req.valid("query")

        const resolvedPath = resolve(path)

        if (!isInsideDir(resolvedPath, PLAYLIST_DIR)) {
          return new Response("Forbidden", { status: 403 })
        }

        const cachePath = join(CACHE_PICTURES_DIR, `${id}.webp`)
        const cacheRoot = relative(process.cwd(), CACHE_PICTURES_DIR)

        const serveCachedCover = () => {
          const middleware = serveStatic({
            root: cacheRoot,
            path: `${id}.webp`
          })
          return middleware(c, async () => {})
        }

        if (existsSync(cachePath)) {
          const file = await serveCachedCover()
          return file ?? c.notFound()
        }

        if (!existsSync(resolvedPath)) {
          return new Response("Song not found", { status: 404 })
        }

        try {
          const metadata = await parseFile(resolvedPath)
          const picture = metadata.common.picture?.[0]

          if (!picture) {
            return new Response("No picture found", { status: 404 })
          }

          await sharp(picture.data)
            .resize(800, 800, { fit: "inside" })
            .toFormat("webp", { quality: 80 })
            .toFile(cachePath)

          const file = await serveCachedCover()
          return file ?? c.notFound()
        } catch (err) {
          console.error(`Error extracting cover for "${resolvedPath}":`, err)
          return new Response("Failed to extract cover", { status: 500 })
        }
      }
    )

  serve(
    {
      fetch: app.fetch,
      port: SERVER_PORT
    },
    (info) => {
      console.log(
        `[ONGAKU-SERVER]: Server is running on http://localhost:${info.port}`
      )
    }
  )
}
