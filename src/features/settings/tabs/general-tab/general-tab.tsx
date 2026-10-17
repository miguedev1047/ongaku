import { LanguageSelection } from '@/features/settings/tabs/general-tab/components/language-selection'
import { AppUpdatesCard } from '@/features/settings/tabs/general-tab/components/app-updates-card'

export function GeneralTab() {
  return (
    <div className='flex flex-col gap-4'>
      <LanguageSelection />
      <AppUpdatesCard />
    </div>
  )
}
