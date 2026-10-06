import { queryOptions } from '@tanstack/react-query'
import { platformService, type AppUpdate } from '@/infrastructure/platform'
import { ONE_HOUR } from '@/constants/times'

export async function checkForUpdates(): Promise<AppUpdate | null> {
  try {
    const update = await platformService.checkForUpdates()
    if (update) {
      console.log(`[ONGAKU]: Update available: v${update.version}`)
      return update
    }
    return null
  } catch (error) {
    console.error('[ONGAKU]: Error checking for updates:', error)
    return null
  }
}

export const updatesQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'updates'] as const,
    queryFn: async () => checkForUpdates(),
    staleTime: ONE_HOUR,
    refetchInterval: ONE_HOUR,
    refetchOnWindowFocus: false,
  })

export const systemUpdatesQueryOptions = updatesQueryOpts
export type { AppUpdate as Update }
