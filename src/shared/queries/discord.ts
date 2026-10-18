import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import type { TDiscordStatus } from '@/infrastructure/platform/platform.types'

export const discordStatusQueryOpts = () =>
  queryOptions<TDiscordStatus>({
    queryKey: ['system', 'discord-status'] as const,
    queryFn: async () => platformService.invoke('get_discord_status'),
    staleTime: 4_000,
    refetchInterval: 5_000,
  })

export const discordStatusQueryOptions = discordStatusQueryOpts
