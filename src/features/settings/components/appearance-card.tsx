import { HugeiconsIcon } from '@hugeicons/react'
import { PaintBoardIcon } from '@hugeicons/core-free-icons'
import { ThemeSelection } from '@/features/settings/components/theme-selection'
import { FolderColorOptions } from '@/features/settings/components/folder-color-options'

export function AppearanceCard() {
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
            Appearance & Interface
          </h2>
          <p className='text-xs text-muted-foreground'>
            Customize the look, themes, and folder colors of the app
          </p>
        </div>
      </div>

      {/* 2. Theme Selection */}
      <ThemeSelection />

      {/* 3. Folder Color Selection */}
      <FolderColorOptions />
    </div>
  )
}
