import { useState } from 'react'
import {
  useAppWallpapers,
  useAppWallpaperMutations,
} from '@/features/settings/hooks'
import { AppWallpapersList } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpapers-list'
import { AppWallpaperUrlDialog } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpaper-url-dialog'
import { AppWallpaperBlurSelection } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpaper-blur-selection'
import { CardWrapper } from '@ongaku/ui'
import { AppWallpaperHeader } from '@/features/settings/tabs/appearance-tab/components/wallpapers/app-wallpaper-header'

export function AppWallpapersSelection() {
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
      <AppWallpaperHeader
        handleImportFile={handleImportFile}
        isImportingFile={isImportingFile}
        openFolder={openFolder}
        setIsUrlDialogOpen={setIsUrlDialogOpen}
      />

      <AppWallpapersList
        wallpapers={wallpapers}
        currentWallpaper={currentWallpaper}
        serverPort={serverPort}
        onSelect={selectWallpaper}
        onDelete={handleDeleteWallpaper}
      />

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
