import { useState } from 'react'
import {
  useAppWallpapers,
  useAppWallpaperMutations,
} from '@/features/settings/hooks'
import { AppWallpaperActionDropdown } from '@/features/settings/components/app-wallpaper-action-dropdown'
import { AppWallpapersList } from '@/features/settings/components/app-wallpapers-list'
import { AppWallpaperUrlDialog } from '@/features/settings/components/app-wallpaper-url-dialog'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { ImageIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

export function AppWallpapersSelection() {
  const { t } = useTranslation()
  const { wallpapers, serverPort, currentWallpaper } = useAppWallpapers()
  const {
    handleImportFile,
    handleImportUrl,
    handleDeleteWallpaper,
    selectWallpaper,
    openFolder,
    isImportingFile,
    isImportingUrl,
  } = useAppWallpaperMutations()

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)

  return (
    <CardWrapper className='@container/bg-card'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5'>
        <div className='flex items-center gap-2.5'>
          <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
            <HugeiconsIcon
              icon={ImageIcon}
              className='size-4'
            />
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

      <AppWallpapersList
        wallpapers={wallpapers}
        currentWallpaper={currentWallpaper}
        serverPort={serverPort}
        onSelect={selectWallpaper}
        onDelete={handleDeleteWallpaper}
      />

      <AppWallpaperUrlDialog
        open={isUrlDialogOpen}
        onOpenChange={setIsUrlDialogOpen}
        onImport={handleImportUrl}
        isImporting={isImportingUrl}
      />
    </CardWrapper>
  )
}
