import { HugeiconsIcon } from '@hugeicons/react'
import { PaintBoardIcon } from '@hugeicons/core-free-icons'
import { ThemeSelection } from '@/features/settings/components/theme-selection'
import { FolderColorOptions } from '@/features/settings/components/folder-color-options'
import { PlayerPositionOptions } from '@/features/settings/components/player-position-options'
import { AppBackgroundsSelection } from '@/features/settings/components/app-backgrounds-selection'
import { useTranslation } from 'react-i18next'

export function AppearanceCard() {
  const { t } = useTranslation()

  return (
    <div className='p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-6'>
      {/* 1. Header */}
      <div className='flex items-center gap-2.5'>
        <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
          <HugeiconsIcon
            icon={PaintBoardIcon}
            className='size-4'
          />
        </div>
        <div>
          <h2 className='text-sm font-semibold text-foreground'>
            {t('settings.tabs.appearance.appearance_and_interface.title')}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {t('settings.tabs.appearance.appearance_and_interface.description')}
          </p>
        </div>
      </div>

      {/* 2. Theme Selection */}
      <ThemeSelection />

      {/* 3. Player Position Selection */}
      <PlayerPositionOptions />

      {/* 4. Folder Color Selection */}
      <FolderColorOptions />

      {/* 5. Custom Wallpaper Selection */}
      <AppBackgroundsSelection />
    </div>
  )
}
