import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export interface TBinariesInfo {
  is_installed: boolean
  bin_dir: string
  ytdlp_installed: boolean
  ffmpeg_installed: boolean
}

export const checkBinariesQueryOpts = () =>
  queryOptions({
    queryKey: ["check-binaries"],
    queryFn: async () => invoke<boolean>("check_binaries"),
    staleTime: Infinity,
    refetchInterval: false
  })

export const binariesInfoQueryOpts = () =>
  queryOptions({
    queryKey: ["binaries-info"],
    queryFn: async () => invoke<TBinariesInfo>("get_binaries_info"),
    staleTime: Infinity,
    refetchInterval: false
  })
