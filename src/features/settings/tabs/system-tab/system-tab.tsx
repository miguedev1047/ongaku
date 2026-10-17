import { ServerHealthCard } from '@/features/settings/tabs/system-tab/components/server-health-card'
import { BinariesStatusCard } from '@/features/settings/tabs/system-tab/components/binaries-status-card'
import { DirectoriesStatusCard } from '@/features/settings/tabs/system-tab/components/directories-status-card'

export function SystemTab() {
  return (
    <div className='flex flex-col gap-4'>
      <ServerHealthCard />
      <BinariesStatusCard />
      <DirectoriesStatusCard />
    </div>
  )
}
