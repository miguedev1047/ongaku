import { queryOptions } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"

export const librarySongsQueryOpts = () =>
  queryOptions({
    queryKey: ["library-songs"],
    queryFn: async () => platformService.invoke("library")
  })
