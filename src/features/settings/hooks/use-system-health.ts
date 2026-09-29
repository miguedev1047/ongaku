import {
  systemKeys,
  systemHealthQueryOptions,
  type TSystemHealthInfo,
  type TDirectoryHealth
} from "@/shared/queries/system"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export type { TSystemHealthInfo, TDirectoryHealth }

export function useSystemHealth() {
  const { data: health, isLoading, isError, refetch } = useQuery(
    systemHealthQueryOptions()
  )
  const queryClient = useQueryClient()

  const refreshHealth = () => {
    queryClient.invalidateQueries({ queryKey: systemKeys.all })
    refetch()
  }

  return {
    health,
    isLoading,
    isError,
    refreshHealth
  }
}
