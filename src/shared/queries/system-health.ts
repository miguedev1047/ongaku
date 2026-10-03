import { queryOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

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
    queryFn: async () => invoke<TSystemHealthInfo>('get_system_health'),
    staleTime: 10_000,
  })

export const systemHealthQueryOptions = systemHealthQueryOpts
