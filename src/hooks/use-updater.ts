import { updatesQueryOpts } from '@/shared/queries/updates'
import { useUpdateStore } from '@/shared/stores/actions'
import { useQuery } from '@tanstack/react-query'

export function useUpdater() {
  const { data: update } = useQuery(updatesQueryOpts())

  const status = useUpdateStore((state) => state.status)
  const progress = useUpdateStore((state) => state.progress)
  const startInstallUpdate = useUpdateStore((state) => state.startInstallUpdate)
  const simulateUpdateDemo = useUpdateStore((state) => state.simulateUpdateDemo)
  const reset = useUpdateStore((state) => state.reset)

  const isPending = status === 'downloading' || status === 'installing'

  const handleInstallUpdate = () => {
    if (update) {
      void startInstallUpdate(update)
    }
  }

  return {
    update,
    status,
    progress,
    isPending,
    handleInstallUpdate,
    simulateUpdateDemo,
    reset,
  }
}
