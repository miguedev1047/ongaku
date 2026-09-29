import {
  systemBinariesCheckQueryOptions,
  systemBinariesInfoQueryOptions,
  systemKeys,
  type TBinariesInfo
} from "@/shared/queries/system"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

export type { TBinariesInfo }

export function useBinaries() {
  const { data: isBinariesInstalled } = useSuspenseQuery(
    systemBinariesCheckQueryOptions()
  )
  const { data: binariesInfo } = useSuspenseQuery(
    systemBinariesInfoQueryOptions()
  )

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await invoke("download_binaries")
    },
    onSuccess: () => {
      toast.success("Tools installed successfully (yt-dlp & ffmpeg)")
      queryClient.invalidateQueries({ queryKey: systemKeys.all })
    },
    onError: () => {
      toast.error("An error occurred while downloading tools")
    }
  })

  const installBinaries = () => {
    mutation.mutate()
  }

  return {
    isBinariesInstalled,
    binariesInfo,
    isPending: mutation.isPending,
    installBinaries
  }
}
