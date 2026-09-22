import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export const checkBinariesQueryOpts = () =>
  queryOptions({
    queryKey: ["check-binaries"],
    queryFn: async () => invoke<boolean>("check_binaries"),
    staleTime: Infinity,
    refetchInterval: false
  })
