import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useBinariesStore } from '@/shared/stores/actions'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { TBinariesInfo } from '@/shared/types/binaries.types'

export type { TBinariesInfo }

export function useBinaries() {
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())

  const isBinariesInstalled = Boolean(
    health.binariesInstalled ?? (health.ytdlpInstalled && health.ffmpegInstalled)
  )

  const binariesInfo: TBinariesInfo = {
    is_installed: isBinariesInstalled,
    bin_dir: health.binDir,
    ytdlp_installed: health.ytdlpInstalled,
    ffmpeg_installed: health.ffmpegInstalled,
  }

  const queryClient = useQueryClient()
  const status = useBinariesStore((state) => state.status)
  const install = useBinariesStore((state) => state.installBinaries)

  const isPending = status === 'installing'

  const installBinaries = async () => {
    const success = await install(queryClient)
    if (success) {
      await queryClient.invalidateQueries({
        ...systemHealthQueryOpts(),
        refetchType: 'all',
      })
    }
  }

  return {
    isBinariesInstalled,
    binariesInfo,
    status,
    isPending,
    installBinaries,
  }
}
