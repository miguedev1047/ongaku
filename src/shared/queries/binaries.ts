import { queryOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

export interface TBinariesInfo {
  is_installed: boolean
  bin_dir: string
  ytdlp_installed: boolean
  ffmpeg_installed: boolean
}

export const binariesCheckQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'binaries', 'check'] as const,
    queryFn: async () => invoke<boolean>('check_binaries'),
    staleTime: Infinity,
    refetchInterval: false,
  })

export const binariesInfoQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'binaries', 'info'] as const,
    queryFn: async () => invoke<TBinariesInfo>('get_binaries_info'),
    staleTime: Infinity,
    refetchInterval: false,
  })

export const systemBinariesCheckQueryOptions = binariesCheckQueryOpts
export const systemBinariesInfoQueryOptions = binariesInfoQueryOpts
