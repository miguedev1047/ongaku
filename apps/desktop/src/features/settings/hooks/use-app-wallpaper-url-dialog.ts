import { useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseAppWallpaperUrlDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onImport: (url: string) => Promise<void>
}

export function useAppWallpaperUrlDialog({
  open,
  onOpenChange,
  onImport,
}: UseAppWallpaperUrlDialogProps) {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const [urlInput, setUrlInput] = useState('')
  const [previewStatus, setPreviewStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [, startTransition] = useTransition()

  const trimmedUrl = urlInput.trim()
  const isValidUrl =
    trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')

  const resetState = () => {
    setUrlInput('')
    setPreviewStatus('idle')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!isValidUrl) {
      toast.error(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.invalid_url',
        ),
      )
      return
    }

    startTransition(async () => {
      try {
        await onImport(trimmedUrl)
        handleOpenChange(false)
      } catch {
        // Error is handled inside onImport / mutation
      }
    })
  }

  return {
    isOpen,
    setIsOpen: handleOpenChange,
    urlInput,
    setUrlInput,
    previewStatus,
    setPreviewStatus,
    trimmedUrl,
    isValidUrl,
    resetState,
    handleSubmit,
  }
}

