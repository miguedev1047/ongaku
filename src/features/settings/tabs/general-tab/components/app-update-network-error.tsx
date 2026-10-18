import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WifiOff01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

interface AppUpdateNetworkErrorProps {
  className?: string
}

export function AppUpdateNetworkError({
  className,
}: AppUpdateNetworkErrorProps) {
  const { t } = useTranslation()

  return (
    <Alert variant='warning' className={cn('w-full', className)}>
      <HugeiconsIcon icon={WifiOff01Icon} className={cn('size-3.5')} />
      <AlertTitle>
        {t('settings.tabs.general.app_and_releases.network_error.title')}
      </AlertTitle>
      <AlertDescription>
        {t('settings.tabs.general.app_and_releases.network_error.description')}
      </AlertDescription>
    </Alert>
  )
}
