import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { HugeiconsIcon } from '@hugeicons/react'
import { WifiOff01Icon, DiscordIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

interface DiscordRpcOfflineCardProps {
  className?: string
}

export function DiscordRpcOfflineCard({
  className,
}: DiscordRpcOfflineCardProps) {
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
            <HugeiconsIcon icon={DiscordIcon} className={cn('size-4')} />
          </div>
          <div>
            <h2 className={cn('text-sm font-semibold text-foreground')}>
              {t('settings.tabs.system.discord_rpc.title', {
                defaultValue: 'Discord Rich Presence',
              })}
            </h2>
            <p className={cn('text-xs text-muted-foreground')}>
              {t('settings.tabs.system.discord_rpc.description', {
                defaultValue:
                  'Desktop IPC socket status and active presence metadata',
              })}
            </p>
          </div>
        </div>

        <Badge variant='warning' className={cn('text-2xs')}>
          <HugeiconsIcon icon={WifiOff01Icon} className={cn('size-3')} />
          {t('settings.tabs.system.discord_rpc.status.offline', {
            defaultValue: 'Offline',
          })}
        </Badge>
      </div>

      <Alert variant='warning'>
        <HugeiconsIcon icon={WifiOff01Icon} className={cn('size-3.5')} />
        <AlertTitle>
          {t('settings.tabs.system.discord_rpc.offline.title', {
            defaultValue: "You're currently offline",
          })}
        </AlertTitle>
        <AlertDescription>
          {t('settings.tabs.system.discord_rpc.offline.description', {
            defaultValue:
              'Discord Rich Presence updates are paused until your internet connection is restored.',
          })}
        </AlertDescription>
      </Alert>
    </CardWrapper>
  )
}
