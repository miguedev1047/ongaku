import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DownloadIcon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  PackageIcon,
  ArrowUpRight01Icon,
} from '@hugeicons/core-free-icons'
import { useUpdater } from '@/hooks/use-updater'
import { usePackageType } from '@/hooks/use-package-type'
import { Show } from '@/components/utility/show'
import { useSuspenseQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { updatesQueryOpts } from '@/shared/queries/updates'
import { openReleaseNotes } from '@/shared/helpers/open-release-notes'
import { useUpdateStore } from '@/shared/stores/actions'
import { DotmSquare10 } from '@/components/loaders/dotm-square-10'
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
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const { data: update } = useSuspenseQuery(updatesQueryOpts())
  const { isFlatpak, isSimulated, supportsInAppUpdates } = usePackageType()
  const {
    status,
    progress,
    isPending,
    handleInstallUpdate,
    simulateUpdateDemo,
    reset,
  } = useUpdater()
  const toggleSimulateFlatpak = useUpdateStore(
    (state) => state.toggleSimulateFlatpak,
  )

  const currentVersion = health.appVersion
  const hasUpdate = Boolean(update?.version)
  const canInstall = hasUpdate && supportsInAppUpdates

  return (
    <div
      className={cn(
        'p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-3',
      )}
    >
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
              Application & Releases
            </h2>
            <p className={cn('text-xs text-muted-foreground')}>
              Installed runtime version and automatic updater channel
            </p>
          </div>
        </div>

        <Show
          when={!isFlatpak}
          fallback={
            <Badge
              variant='secondary'
              className={cn(
                'text-[10px] gap-1 bg-sky-500/10 text-sky-500 border-sky-500/20',
              )}
            >
              <HugeiconsIcon
                icon={PackageIcon}
                className={cn('size-3')}
              />
              Flatpak
            </Badge>
          }
        >
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
                Up to date
              </Badge>
            }
          >
            <Badge
              variant='default'
              className={cn(
                'text-[10px] gap-1 bg-primary text-primary-foreground font-semibold',
              )}
            >
              Update Available
            </Badge>
          </Show>
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
              Current Version:
            </span>
            <span className={cn('font-mono text-xs font-bold text-foreground')}>
              v{currentVersion}
            </span>
          </div>

          <Show
            when={canInstall}
            fallback={
              <ReleaseNotesLink
                version={currentVersion}
                label={`What's new in v${currentVersion}`}
              />
            }
          >
            <p className={cn('text-xs text-primary font-medium')}>
              New version v{update?.version} is ready to install!
            </p>
            <ReleaseNotesLink
              version={update?.version}
              label={`View v${update?.version} release notes`}
            />
          </Show>
        </div>

        <Show when={canInstall}>
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
                  fallback={`Install v${update?.version}`}
                >
                  <Show
                    when={progress.percentage > 0}
                    fallback={
                      <Show
                        when={status === 'installing'}
                        fallback='Updating...'
                      >
                        Installing...
                      </Show>
                    }
                  >
                    Updating {progress.percentage}%
                  </Show>
                </Show>
              </span>
            </Button>
          </div>
        </Show>
      </div>

      <Show when={isFlatpak}>
        <div
          className={cn(
            'flex items-start gap-3 p-3 rounded-md bg-sky-500/5 border border-sky-500/20 animate-in fade-in duration-200',
          )}
        >
          <div
            className={cn(
              'shrink-0 flex items-center justify-center size-8 rounded-md bg-sky-500/10 text-sky-500',
            )}
          >
            <HugeiconsIcon
              icon={PackageIcon}
              className={cn('size-4')}
            />
          </div>
          <div className={cn('min-w-0 flex-1 space-y-0.5')}>
            <p className={cn('text-xs font-semibold text-foreground')}>
              Updates are managed by Flatpak
            </p>
            <p className={cn('text-[11px] text-muted-foreground')}>
              This build runs inside a Flatpak sandbox. New versions are
              delivered through Flathub and installed by your software center
              or with <span className={cn('font-mono')}>flatpak update</span>.
            </p>
          </div>
        </div>
      </Show>

      <Show when={isPending && supportsInAppUpdates}>
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
                  fallback='Downloading application update...'
                >
                  Installing application update...
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
              label="Read what's changing while you wait"
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
              Detected: <span className={cn('font-mono')}>{health.packageType}</span>
            </span>
          </div>
          <div className={cn('flex items-center gap-1.5')}>
            <Button
              size='sm'
              variant='outline'
              onClick={toggleSimulateFlatpak}
              disabled={isPending}
              className={cn(
                'h-7 text-[11px] px-2.5 gap-1.5',
                isSimulated && 'border-sky-500/40 text-sky-500 bg-sky-500/5',
              )}
            >
              <HugeiconsIcon
                icon={PackageIcon}
                className={cn('size-3')}
              />
              <Show
                when={isSimulated}
                fallback='Simulate Flatpak'
              >
                Exit Flatpak mode
              </Show>
            </Button>
            <Button
              size='sm'
              variant='outline'
              disabled={isPending || isFlatpak}
              onClick={simulateUpdateDemo}
              className={cn('h-7 text-[11px] px-2.5 gap-1.5')}
            >
              <HugeiconsIcon
                icon={SparklesIcon}
                className={cn('size-3 text-amber-500')}
              />
              <span>Simulate Update</span>
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
                Reset
              </Button>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
