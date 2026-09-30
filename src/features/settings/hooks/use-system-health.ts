import {
  systemHealthQueryOpts,
  type TSystemHealthInfo,
  type TDirectoryHealth,
} from '@/shared/queries/system-health'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type { TSystemHealthInfo, TDirectoryHealth }

export function useSystemHealth() {
  const { data: health, isLoading, isError, refetch } = useQuery(
    systemHealthQueryOpts()
  )
  const queryClient = useQueryClient()

  const refreshHealth = () => {
    queryClient.invalidateQueries({ queryKey: ['system'] })
    refetch()
  }

  return {
    health,
    isLoading,
    isError,
    refreshHealth,
  }
}
