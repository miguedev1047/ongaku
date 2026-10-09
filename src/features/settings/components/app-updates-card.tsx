import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Spinner } from '@/components/ui/spinner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DownloadIcon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons'
import { useUpdater } from '@/hooks/use-updater'
import { Show } from '@/components/utility/show'
import { useSuspenseQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { updatesQueryOpts } from '@/shared/queries/updates'
import { openReleaseNotes } from '@/shared/helpers/open-release-notes'
import { DotmSquare10 } from '@/components/generic/loaders/dotm-square-10'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

interface ReleaseNotesLinkProps {
  version?: string
  label: string
  className?: string
}

function ReleaseNotesLink({ version, label, className }: ReleaseNotesLinkProps) {
  const handleOpen = () => {
    void openReleaseNotes(version)
  }

  return (
    <p
      role='link'
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOpen()
        }
      }}
      className={cn(
        'inline-flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer hover:underline hover:text-foreground underline-offset-2 transition-colors focus-visible:outline-none focus-visible:underline focus-visible:text-foreground',
        className,
      )}
    >
      <span>{label}</span>
      <HugeiconsIcon
        icon={ArrowUpRight01Icon}
        className={cn('size-3')}
      />
    </p>
  )
}

export function AppUpdatesCard() {
  const { t } = useTranslation()
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const { data: update } = useSuspenseQuery(updatesQueryOpts())
  const {
    status,
    progress,
    isPending,
    handleInstallUpdate,
    simulateUpdateDemo,
    reset,
  } = useUpdater()

  const currentVersion = health.appVersion
  const hasUpdate = Boolean(update?.version)

  return (
    <CardWrapper spacing='compact'>
      <div className={cn('flex items-center justify-between')}>
        <div className={cn('flex items-center gap-2.5')}>
          <div
            className={cn(
              'size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary',
            )}
          >
            <HugeiconsIcon
              icon={SparklesIcon}
              className={cn('size-4')}
            />
          </div>
          <div>
            <h2 className={cn('text-sm font-semibold text-foreground')}>
              {t('settings.tabs.general.app_and_releases.title')}
            </h2>
            <p className={cn('text-xs text-muted-foreground')}>
              {t('settings.tabs.general.app_and_releases.description')}
            </p>
          </div>
        </div>

        <Show
          when={hasUpdate}
          fallback={
            <Badge
              variant='secondary'
              className={cn(
                'text-[10px] gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              )}
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className={cn('size-3')}
              />
              {t('settings.tabs.general.app_and_releases.status.updated')}
            </Badge>
          }
        >
          <Badge
            variant='default'
            className={cn(
              'text-[10px] gap-1 bg-primary text-primary-foreground font-semibold',
            )}
          >
            {t('settings.tabs.general.app_and_releases.status.available')}
          </Badge>
        </Show>
      </div>

      <div
        className={cn(
          'flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-md bg-muted/30 border border-border/30 gap-3',
        )}
      >
        <div className={cn('space-y-1')}>
          <div className={cn('flex items-center gap-2')}>
            <span className={cn('text-xs text-muted-foreground')}>
              {t('settings.tabs.general.app_and_releases.version.title')}:
            </span>
            <span className={cn('font-mono text-xs font-bold text-foreground')}>
              v{currentVersion}
            </span>
          </div>

          <Show
            when={hasUpdate}
            fallback={
              <ReleaseNotesLink
                version={currentVersion}
                label={t('settings.tabs.general.app_and_releases.version.link', {
                  version: `v${currentVersion}`,
                })}
              />
            }
          >
            <p className={cn('text-xs text-primary font-medium')}>
              {t('settings.tabs.general.app_and_releases.version.ready_to_install', {
                version: `v${update?.version}`,
              })}
            </p>
            <ReleaseNotesLink
              version={update?.version}
              label={t('settings.tabs.general.app_and_releases.version.link', {
                version: `v${update?.version}`,
              })}
            />
          </Show>
        </div>

        <Show when={hasUpdate}>
          <div className={cn('flex items-center gap-2')}>
            <Button
              size='sm'
              onClick={handleInstallUpdate}
              disabled={isPending}
              className={cn('h-8 text-xs gap-1.5')}
            >
              <Show
                when={!isPending}
                fallback={<Spinner className={cn('size-3.5')} />}
              >
                <HugeiconsIcon
                  icon={DownloadIcon}
                  className={cn('size-3.5')}
                />
              </Show>
              <span>
                <Show
                  when={isPending}
                  fallback={t(
                    'settings.tabs.general.app_and_releases.actions.install_version',
                    { version: `v${update?.version}` },
                  )}
                >
                  <Show
                    when={progress.percentage > 0}
                    fallback={
                      <Show
                        when={status === 'installing'}
                        fallback={t(
                          'settings.tabs.general.app_and_releases.actions.updating',
                        )}
                      >
                        {t(
                          'settings.tabs.general.app_and_releases.actions.installing',
                        )}
                      </Show>
                    }
                  >
                    {t(
                      'settings.tabs.general.app_and_releases.actions.updating_percentage',
                      { percent: progress.percentage },
                    )}
                  </Show>
                </Show>
              </span>
            </Button>
          </div>
        </Show>
      </div>

      <Show when={isPending}>
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-1 duration-200',
          )}
        >
          <div
            className={cn(
              'shrink-0 flex items-center justify-center size-8 rounded-md bg-primary/10 text-primary',
            )}
          >
            <DotmSquare10
              size={18}
              dotSize={2.5}
              speed={1.5}
            />
          </div>
          <div className={cn('min-w-0 flex-1 space-y-1.5')}>
            <div className={cn('flex items-center justify-between text-xs')}>
              <span className={cn('font-semibold text-foreground')}>
                <Show
                  when={status === 'installing'}
                  fallback={t(
                    'settings.tabs.general.app_and_releases.actions.downloading_app',
                  )}
                >
                  {t(
                    'settings.tabs.general.app_and_releases.actions.installing_app',
                  )}
                </Show>
              </span>
              <Show when={progress.percentage > 0}>
                <span
                  className={cn('font-mono text-[11px] text-primary font-bold')}
                >
                  {progress.percentage}%
                </span>
              </Show>
            </div>
            <Show when={progress.total > 0}>
              <div
                className={cn(
                  'h-1.5 w-full bg-primary/15 rounded-sm overflow-hidden',
                )}
              >
                <div
                  className={cn('h-full bg-primary transition-all duration-200')}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </Show>
            <ReleaseNotesLink
              version={update?.version}
              label={t(
                'settings.tabs.general.app_and_releases.actions.read_changes',
              )}
            />
          </div>
        </div>
      </Show>

      <Show when={import.meta.env.DEV}>
        <div
          className={cn(
            'pt-2 border-t border-border/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs',
          )}
        >
          <div className={cn('flex items-center gap-1.5 text-muted-foreground')}>
            <Badge
              variant='outline'
              className={cn(
                'text-[9px] font-mono px-1 py-0 h-4 border-amber-500/40 text-amber-500 bg-amber-500/5',
              )}
            >
              DEV
            </Badge>
            <span className={cn('text-[11px]')}>
              {t('settings.tabs.general.app_and_releases.actions.package')}{' '}
              <span className={cn('font-mono')}>{health.packageType}</span>
            </span>
          </div>
          <div className={cn('flex items-center gap-1.5')}>
            <Button
              size='sm'
              variant='outline'
              disabled={isPending}
              onClick={simulateUpdateDemo}
              className={cn('h-7 text-[11px] px-2.5 gap-1.5')}
            >
              <HugeiconsIcon
                icon={SparklesIcon}
                className={cn('size-3 text-amber-500')}
              />
              <span>
                {t(
                  'settings.tabs.general.app_and_releases.actions.simulate_update',
                )}
              </span>
            </Button>
            <Show when={status !== 'idle'}>
              <Button
                size='sm'
                variant='ghost'
                onClick={reset}
                className={cn(
                  'h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground',
                )}
              >
                {t('settings.tabs.general.app_and_releases.actions.reset')}
              </Button>
            </Show>
          </div>
        </div>
      </Show>
    </CardWrapper>
  )
}
