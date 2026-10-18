import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { HugeiconsIcon } from '@hugeicons/react'
import { WifiOff01Icon, Wrench01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

interface BinariesOfflineCardProps {
  className?: string
}

export function BinariesOfflineCard({ className }: BinariesOfflineCardProps) {
  const { t } = useTranslation()

  return (
    <CardWrapper spacing='compact' className={cn(className)}>
      <div className={cn('flex items-center justify-between')}>
        <div className={cn('flex items-center gap-2.5')}>
          <div
            className={cn(
              'size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary',
            )}
          >
            <HugeiconsIcon icon={Wrench01Icon} className={cn('size-4')} />
          </div>
          <div>
            <h2 className={cn('text-sm font-semibold text-foreground')}>
              {t('settings.tabs.system.binaries_status.title')}
            </h2>
            <p className={cn('text-xs text-muted-foreground')}>
              {t('settings.tabs.system.binaries_status.description')}
            </p>
          </div>
        </div>

        <Badge variant='warning' className={cn('text-2xs')}>
          <HugeiconsIcon icon={WifiOff01Icon} className={cn('size-3')} />
          {t('settings.tabs.system.binaries_status.status.offline')}
        </Badge>
      </div>

      <Alert variant='warning'>
        <HugeiconsIcon icon={WifiOff01Icon} className={cn('size-3.5')} />
        <AlertTitle>
          {t('settings.tabs.system.binaries_status.offline.title')}
        </AlertTitle>
        <AlertDescription>
          {t('settings.tabs.system.binaries_status.offline.description')}
        </AlertDescription>
      </Alert>
    </CardWrapper>
  )
}
