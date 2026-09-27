import { queryOptions } from "@tanstack/react-query"
import { checkForUpdates } from "@/lib/check-updates"
import { ONE_HOUR } from "@/constants/times"

export const updatesQueryOpts = () =>
  queryOptions({
    queryKey: ["app-updates"],
    queryFn: async () => checkForUpdates(),
    staleTime: ONE_HOUR,
    refetchInterval: ONE_HOUR,
    refetchOnWindowFocus: false
  })
