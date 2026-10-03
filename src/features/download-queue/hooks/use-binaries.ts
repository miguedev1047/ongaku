import {
  binariesCheckQueryOpts,
  binariesInfoQueryOpts,
  type TBinariesInfo,
} from '@/shared/queries/binaries'
import { useBinariesStore } from '@/shared/stores/actions'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

export type { TBinariesInfo }

export function useBinaries() {
  const { data: isBinariesInstalled } = useSuspenseQuery(
    binariesCheckQueryOpts()
  )
  const { data: binariesInfo } = useSuspenseQuery(
    binariesInfoQueryOpts()
  )

  const queryClient = useQueryClient()
  const status = useBinariesStore((state) => state.status)
  const install = useBinariesStore((state) => state.installBinaries)

  const isPending = status === 'installing'

  const installBinaries = () => {
    void install(queryClient)
  }

  return {
    isBinariesInstalled,
    binariesInfo,
    status,
    isPending,
    installBinaries,
  }
}
