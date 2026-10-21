import { ServerHealthCard } from '@/features/settings/tabs/system-tab/components/server-health-card'
import { DiscordRpcStatusCard } from '@/features/settings/tabs/system-tab/components/discord-rpc-status-card'
import { DiscordRpcOfflineCard } from '@/features/settings/tabs/system-tab/components/discord-rpc-offline-card'
import { BinariesStatusCard } from '@/features/settings/tabs/system-tab/components/binaries-status-card'
import { DirectoriesStatusCard } from '@/features/settings/tabs/system-tab/components/directories-status-card'
import { Show } from '@/components/utility/show'
import { useSuspenseQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useNetworkState } from '@/hooks/use-network-state'

export function SystemTab() {
  const { data: config } = useSuspenseQuery(systemConfigQueryOpts())
  const { isOnline } = useNetworkState()
  const isDiscordRpcEnabled = config.discord_rpc === 'true'

  return (
    <div className='flex flex-col gap-4'>
      <ServerHealthCard />

      <Show when={isDiscordRpcEnabled}>
        <Show when={Boolean(isOnline)} fallback={<DiscordRpcOfflineCard />}>
          <DiscordRpcStatusCard />
        </Show>
      </Show>

      <BinariesStatusCard />
      <DirectoriesStatusCard />
    </div>
  )
}
