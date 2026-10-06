import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'

export interface TDirectoryHealth {
  id: string
  name: string
  path: string
  exists: boolean
  writable: boolean
}

export type TPackageType =
  | 'appimage'
  | 'deb'
  | 'exe'
  | 'dmg'
  | 'unknown'

export interface TSystemHealthInfo {
  serverHealthy: boolean
  serverPort: number
  serverHost: string
  appVersion: string
  binariesInstalled: boolean
  ytdlpInstalled: boolean
  ffmpegInstalled: boolean
  binDir: string
  musicDir: string
  dbPath: string
  dbExists: boolean
  directories: TDirectoryHealth[]
  packageType: TPackageType
}

export const systemHealthQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'health'] as const,
    queryFn: async () => platformService.invoke('get_system_health'),
    staleTime: 10_000,
  })

export const systemHealthQueryOptions = systemHealthQueryOpts
