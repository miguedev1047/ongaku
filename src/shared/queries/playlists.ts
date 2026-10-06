import { queryOptions } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"

export const playlistsQueryOpts = () =>
  queryOptions({
    queryKey: ["playlists"],
    queryFn: async () => platformService.invoke("get_playlists")
  })
