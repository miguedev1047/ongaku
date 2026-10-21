import { useSuspenseQuery } from '@tanstack/react-query'
import { TDirectoryHealth } from './use-system-health'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { selectDirectory, useChangeAppDir } from './use-config'
import { openFolder } from '@/shared/helpers/open-folder'
import { toast } from 'sonner'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'

export function useDirectoriesStatus() {
  const { t } = useTranslation()
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const { data: config } = useSuspenseQuery(systemConfigQueryOpts())

  const directories: TDirectoryHealth[] = health.directories

  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { mutate: changeAppDir, isPending: isChangingDir } = useChangeAppDir()

  const handleOpen = async (path: string) => {
    try {
      await openFolder(path)
    } catch {
      toast.error(t('toasts.config.open_folder_error', { path }))
    }
  }

  const handleSelectDirectory = async () => {
    try {
      const selected = await selectDirectory()
      if (selected) {
        setPendingPath(selected)
        setIsConfirmOpen(true)
      }
    } catch {
      toast.error(t('toasts.config.select_dir_error'))
    }
  }

  const handleConfirmMove = () => {
    if (!pendingPath) return
    changeAppDir(pendingPath, {
      onSettled: () => {
        setIsConfirmOpen(false)
        setPendingPath(null)
      },
    })
  }

  return {
    health,
    config,
    directories,
    pendingPath,
    setPendingPath,
    isConfirmOpen,
    setIsConfirmOpen,
    changeAppDir,
    isChangingDir,
    handleOpen,
    handleSelectDirectory,
    handleConfirmMove,
  }
}
