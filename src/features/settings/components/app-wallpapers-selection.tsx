import { useState } from 'react'
import {
  useAppWallpapers,
  useAppWallpaperMutations,
} from '@/features/settings/hooks'
import { AppWallpapersList } from '@/features/settings/components/app-wallpapers-list'
import { AppWallpaperUrlDialog } from '@/features/settings/components/app-wallpaper-url-dialog'
import { AppWallpaperBlurSelection } from '@/features/settings/components/app-wallpaper-blur-selection'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { AppWallpaperHeader } from '@/features/settings/components/app-wallpaper-header'
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
      {/* 1. Main Header */}
      <AppWallpaperHeader
        handleImportFile={handleImportFile}
        isImportingFile={isImportingFile}
        openFolder={openFolder}
        setIsUrlDialogOpen={setIsUrlDialogOpen}
      />

      {/* 2. Sub-section: Wallpaper Selection */}
      <div className='space-y-2'>
        <div>
          <h3 className='text-xs font-medium text-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.list_title',
            )}
          </h3>
          <p className='text-3xs text-muted-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.list_description',
            )}
          </p>
        </div>

        <AppWallpapersList
          wallpapers={wallpapers}
          currentWallpaper={currentWallpaper}
          serverPort={serverPort}
          onSelect={selectWallpaper}
          onDelete={handleDeleteWallpaper}
        />
      </div>

      {/* 3. Sub-section: Blur Settings */}
      <AppWallpaperBlurSelection />

      <AppWallpaperUrlDialog
        open={isUrlDialogOpen}
        onOpenChange={setIsUrlDialogOpen}
        onImport={handleImportUrl}
        isImporting={isImportingUrl}
      />
    </CardWrapper>
  )
}
