import { HugeiconsIcon } from '@hugeicons/react'
import { DiscordIcon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Switch } from '@/components/ui/switch'
import { platformService } from '@/infrastructure/platform'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export function DiscordRpcToggle() {
  const { t } = useTranslation()
  const { data: config } = useSuspenseQuery(systemConfigQueryOpts())
  const updateConfig = useUpdateConfig()

  const isEnabled = config.discord_rpc === 'true'

  const handleToggle = (checked: boolean) => {
    const value = checked ? 'true' : 'false'
    updateConfig.mutate({ key: 'discord_rpc', value })
    void platformService.invoke('set_discord_rpc_enabled', { enabled: checked })
  }

  return (
    <CardWrapper spacing='compact'>
      <div className={cn('flex items-center justify-between gap-4')}>
        <div className={cn('flex items-center gap-2.5')}>
          <div
            className={cn(
              'size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary',
            )}
          >
            <HugeiconsIcon icon={DiscordIcon} className={cn('size-4')} />
          </div>
          <label htmlFor='rpc-toggle'>
            <h2 className={cn('text-sm font-semibold text-foreground')}>
              {t('settings.tabs.general.discord_rpc.title', {
                defaultValue: 'Discord Rich Presence',
              })}
            </h2>
            <p className={cn('text-xs text-muted-foreground')}>
              {t('settings.tabs.general.discord_rpc.description', {
                defaultValue:
                  'Display your currently playing music as your Discord activity status',
              })}
            </p>
          </label>
        </div>

        <Switch
          id='rpc-toggle'
          checked={isEnabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </CardWrapper>
  )
}
