import { useState } from 'react'
import {
  useAppWallpapers,
  useAppWallpaperMutations,
} from '@/features/settings/hooks'
import { AppWallpapersList } from '@/features/settings/components/app-wallpapers-list'
import { AppWallpaperUrlDialog } from '@/features/settings/components/app-wallpaper-url-dialog'
import { AppWallpaperBlurSelection } from '@/features/settings/components/app-wallpaper-blur-selection'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Separator } from '@/components/ui/separator'
import { AppWallpaperHeader } from '@/features/settings/components/app-wallpaper-header'

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

      <AppWallpaperBlurSelection />

      <Separator />

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
