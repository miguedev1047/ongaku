import type { FinalColor } from "extract-colors/lib/types/Color"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { formatPlaylistDuration } from "@/shared/helpers/total-tracks-hours"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { extractColors } from "extract-colors"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export function PlaylistSongHero() {
  const [imgColor, setImgColor] = useState<FinalColor | null>(null)
  const { getCoverUrl } = useSongUtils()
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const {
    data: songs,
    isLoading,
    isError
  } = useQuery(playlistSongsQueryOpts(playlistName))

  if (!songs) return
  if (isLoading || isError) return

  const [firstSong] = songs

  const coverUrl = getCoverUrl({ song: firstSong })
  const tracksCount = songs.length

  useEffect(() => {
    const src = coverUrl
    extractColors(src)
      .then((color) => {
        const [firstColor] = color
        setImgColor(firstColor)
      })
      .catch(() => setImgColor(null))
  }, [])

  return (
    <div className="flex shrink-0 items-center gap-2 px-6 pt-6">
      <div
        className="flex items-end justify-between gap-6 w-full bg-card p-4 transition-all ease-in-out duration-300"
        style={{ backgroundColor: imgColor ? `${imgColor.hex}50` : "" }}
      >
        <figure className="size-40 shrink-0">
          <CoverImage
            src={coverUrl}
            alt={firstSong.name}
          />
        </figure>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold">{playlistName}</h1>
          <div className="flex items-center gap-5 text-muted-foreground">
            <p>{tracksCount} tracks</p>
            <p>-</p>
            <p>{formatPlaylistDuration(songs)}</p>
          </div>
        </div>
        <div className="ml-auto"></div>
      </div>
    </div>
  )
}
