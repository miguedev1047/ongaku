import { queryOptions } from '@tanstack/react-query'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { ONE_HOUR } from '@/constants/times'

export async function checkForUpdates(): Promise<Update | null> {
  try {
    const update = await check()
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
export type { Update }
