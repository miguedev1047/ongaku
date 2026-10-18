import { Badge } from '@/components/ui/badge'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  DiscordIcon,
} from '@hugeicons/core-free-icons'
import { Show } from '@/components/utility/show'
import { useSuspenseQuery } from '@tanstack/react-query'
import { discordStatusQueryOpts } from '@/shared/queries/discord'
import { resolveSetupWarning } from '@/features/settings/tabs/system-tab/helpers/resolve-setup-warning'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

export function DiscordRpcStatusCard() {
  const { t } = useTranslation()
  const { data: status } = useSuspenseQuery(discordStatusQueryOpts())

  const setupWarning = resolveSetupWarning(t, status.setup_warning)

  return (
    <CardWrapper spacing='compact'>
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

        <Show
          when={status.connected}
          fallback={
            <Badge variant='destructive'>
              <HugeiconsIcon icon={AlertCircleIcon} className={cn('size-3')} />
              {t('settings.tabs.system.discord_rpc.status.disconnected', {
                defaultValue: 'Disconnected',
              })}
            </Badge>
          }
        >
          <Badge variant='success'>
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className={cn('size-3')}
            />
            {t('settings.tabs.system.discord_rpc.status.connected', {
              defaultValue: 'Connected',
            })}
          </Badge>
        </Show>
      </div>

      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs')}>
        <div
          className={cn('p-2.5 rounded-md bg-muted/40 border border-border/30')}
        >
          <span
            className={cn(
              'text-2xs text-muted-foreground block uppercase tracking-wider font-semibold',
            )}
          >
            {t('settings.tabs.system.discord_rpc.connection', {
              defaultValue: 'IPC Socket',
            })}
          </span>
          <span
            className={cn('font-medium text-foreground mt-0.5 block truncate')}
          >
            <Show
              when={status.connected}
              fallback={t('settings.tabs.system.discord_rpc.not_detected', {
                defaultValue: 'No Discord Client',
              })}
            >
              {t('settings.tabs.system.discord_rpc.active_pipe', {
                defaultValue: 'Active (Named Pipe)',
              })}
            </Show>
          </span>
        </div>

        <div
          className={cn('p-2.5 rounded-md bg-muted/40 border border-border/30')}
        >
          <span
            className={cn(
              'text-2xs text-muted-foreground block uppercase tracking-wider font-semibold',
            )}
          >
            {t('settings.tabs.system.discord_rpc.active_track', {
              defaultValue: 'Current Presence',
            })}
          </span>
          <span
            className={cn('font-medium text-foreground mt-0.5 block truncate')}
          >
            {status.activity_title ||
              t('settings.tabs.system.discord_rpc.idle', {
                defaultValue: 'Idle (No Track Playing)',
              })}
          </span>
        </div>
      </div>

      <Show when={status.activity_error}>
        {(message) => (
          <Alert variant='destructive-muted'>
            <HugeiconsIcon icon={AlertCircleIcon} className={cn('size-3.5')} />
            <AlertTitle>
              {t('settings.tabs.system.discord_rpc.activity_error_title', {
                defaultValue: 'Presence Rejected by Discord',
              })}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </Show>

      <Show when={setupWarning}>
        {(message) => (
          <Alert variant='warning'>
            <HugeiconsIcon icon={AlertCircleIcon} className={cn('size-3.5')} />
            <AlertTitle>
              {t('settings.tabs.system.discord_rpc.setup_warning.title', {
                defaultValue: 'Discord Developer Portal Setup',
              })}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </Show>

      <Show when={Boolean(!status.connected && status.last_error)}>
        <Alert variant='destructive'>
          <HugeiconsIcon icon={AlertCircleIcon} className={cn('size-3.5')} />
          <AlertTitle>
            {t('settings.tabs.system.discord_rpc.error_title', {
              defaultValue: 'Discord Connection Notice',
            })}
          </AlertTitle>
          <AlertDescription>
            {status.last_error ||
              t('settings.tabs.system.discord_rpc.error_desc', {
                defaultValue:
                  'Ensure the Discord desktop client is open and running on your system.',
              })}
          </AlertDescription>
        </Alert>
      </Show>
    </CardWrapper>
  )
}
