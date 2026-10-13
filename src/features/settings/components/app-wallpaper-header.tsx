import { AppWallpaperActionDropdown } from '@/features/settings/components/app-wallpaper-action-dropdown'
import { ImageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

interface AppWallpaperHeaderProps {
  handleImportFile: () => void
  openFolder: () => void
  setIsUrlDialogOpen: (value: boolean) => void
  isImportingFile: boolean
}

export function AppWallpaperHeader({
  handleImportFile,
  isImportingFile,
  openFolder,
  setIsUrlDialogOpen,
}: AppWallpaperHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5'>
      <div className='flex items-center gap-2.5'>
        <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
          <HugeiconsIcon icon={ImageIcon} className='size-4' />
        </div>
        <div>
          <h2 className='text-sm font-semibold text-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.title',
            )}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.description',
            )}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-1.5 self-start sm:self-auto'>
        <AppWallpaperActionDropdown
          onImportFile={handleImportFile}
          isImportingFile={isImportingFile}
          onOpenUrlDialog={() => setIsUrlDialogOpen(true)}
          onOpenFolder={openFolder}
        />
      </div>
    </div>
  )
}
