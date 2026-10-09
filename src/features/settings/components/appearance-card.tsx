import { ThemeSelection } from '@/features/settings/components/theme-selection'
import { FolderColorOptions } from '@/features/settings/components/folder-color-options'
import { PlayerPositionOptions } from '@/features/settings/components/player-position-options'
import { AppWallpapersSelection } from '@/features/settings/components/app-wallpapers-selection'

export function AppearanceCard() {
  return (
    <>
      <ThemeSelection />
      <PlayerPositionOptions />
      <FolderColorOptions />
      <AppWallpapersSelection />
    </>
  )
}

