import { useRouteContext } from "@tanstack/react-router"
import { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import {
  getCoverUrl as getBaseCoverUrl,
  getSongUrl as getBaseSongUrl
} from "@/lib/song-utils"

export function useServerPort() {
  const { serverPort } = useRouteContext({ from: "__root__" })
  return serverPort
}

export function useSongUtils() {
  const { serverPort } = useRouteContext({ from: "__root__" })

  const getCoverUrl = ({ song }: { song: TPlaylistSong }) => {
    return getBaseCoverUrl({ song, port: serverPort })
  }

  const getSongUrl = ({ song }: { song: TPlaylistSong }) => {
    return getBaseSongUrl({ song, port: serverPort })
  }

  return {
    serverPort,
    getCoverUrl,
    getSongUrl
  }
}
