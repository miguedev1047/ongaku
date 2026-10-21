import { PlayerPositionOptions } from '@/features/settings/tabs/appearance-tab/components/player-position-options'
import { ThemeSelection } from '@/features/settings/tabs/appearance-tab/components/theme-selection'
import { FolderColorOptions } from '@/features/settings/tabs/appearance-tab/components/folder-color-options'
import { AppWallpapersSelection } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpapers-selection'

export function AppearanceTab() {
  return (
    <div className='flex flex-col gap-4'>
      <PlayerPositionOptions />
      <ThemeSelection />
      <FolderColorOptions />
      <AppWallpapersSelection />
    </div>
  )
}
