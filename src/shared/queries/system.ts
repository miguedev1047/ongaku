import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { checkForUpdates } from "@/lib/check-updates"
import { ONE_HOUR } from "@/constants/times"

export interface TDirectoryHealth {
  id: string
  name: string
  path: string
  exists: boolean
  writable: boolean
}

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
}

export interface TBinariesInfo {
  is_installed: boolean
  bin_dir: string
  ytdlp_installed: boolean
  ffmpeg_installed: boolean
}

export const systemKeys = {
  all: ["system"] as const,
  health: () => [...systemKeys.all, "health"] as const,
  updates: () => [...systemKeys.all, "updates"] as const,
  binaries: () => [...systemKeys.all, "binaries"] as const,
  binariesCheck: () => [...systemKeys.binaries(), "check"] as const,
  binariesInfo: () => [...systemKeys.binaries(), "info"] as const,
} as const

export const systemHealthQueryOptions = () =>
  queryOptions({
    queryKey: systemKeys.health(),
    queryFn: async () => invoke<TSystemHealthInfo>("get_system_health"),
    staleTime: 10_000,
  })

export const systemUpdatesQueryOptions = () =>
  queryOptions({
    queryKey: systemKeys.updates(),
    queryFn: async () => checkForUpdates(),
    staleTime: ONE_HOUR,
    refetchInterval: ONE_HOUR,
    refetchOnWindowFocus: false,
  })

export const systemBinariesCheckQueryOptions = () =>
  queryOptions({
    queryKey: systemKeys.binariesCheck(),
    queryFn: async () => invoke<boolean>("check_binaries"),
    staleTime: Infinity,
    refetchInterval: false,
  })

export const systemBinariesInfoQueryOptions = () =>
  queryOptions({
    queryKey: systemKeys.binariesInfo(),
    queryFn: async () => invoke<TBinariesInfo>("get_binaries_info"),
    staleTime: Infinity,
    refetchInterval: false,
  })
