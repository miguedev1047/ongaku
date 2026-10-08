import { ThemeSelection } from '@/features/settings/components/theme-selection'
import { FolderColorOptions } from '@/features/settings/components/folder-color-options'
import { PlayerPositionOptions } from '@/features/settings/components/player-position-options'
import { AppBackgroundsSelection } from '@/features/settings/components/app-backgrounds-selection'

export function AppearanceCard() {
  return (
    <>
      <ThemeSelection />
      <PlayerPositionOptions />
      <FolderColorOptions />
      <AppBackgroundsSelection />
    </>
  )
}

