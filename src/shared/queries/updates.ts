import { queryOptions } from "@tanstack/react-query"
import { checkForUpdates } from "@/lib/check-updates"

export const updatesQueryOpts = () =>
  queryOptions({
    queryKey: ["app-updates"],
    queryFn: async () => checkForUpdates(),
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  })
