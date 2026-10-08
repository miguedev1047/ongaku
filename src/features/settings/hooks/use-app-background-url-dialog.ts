import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseAppBackgroundUrlDialogProps {
  onImport: (url: string) => Promise<unknown> | void
}

export function useAppBackgroundUrlDialog({
  onImport,
}: UseAppBackgroundUrlDialogProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [previewStatus, setPreviewStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const trimmedUrl = urlInput.trim()
  const isValidUrl =
    trimmedUrl.length > 10 &&
    (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))

  useEffect(() => {
    if (isValidUrl) {
      setPreviewStatus('loading')
    } else {
      setPreviewStatus('idle')
    }
  }, [trimmedUrl, isValidUrl])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setUrlInput('')
      setPreviewStatus('idle')
    }
  }

  const handleSubmit = async () => {
    if (!isValidUrl) {
      toast.error(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.invalid_url',
        ),
      )
      return
    }

    try {
      await onImport(trimmedUrl)
      setIsOpen(false)
      setUrlInput('')
      setPreviewStatus('idle')
    } catch {
      // Any error is already surfaced by the mutation's onError callback
    }
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
    handleSubmit,
  }
}
