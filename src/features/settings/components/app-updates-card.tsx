import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { DownloadIcon, CheckmarkCircle02Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { useUpdater } from "@/hooks/use-updater"
import { Show } from "@/components/utility/show"
import { useSuspenseQuery } from "@tanstack/react-query"
import { systemHealthQueryOptions, systemUpdatesQueryOptions } from "@/shared/queries/system"

export function AppUpdatesCard() {
  const { data: health } = useSuspenseQuery(systemHealthQueryOptions())
  const { data: update } = useSuspenseQuery(systemUpdatesQueryOptions())
  const { progress, isPending, handleInstallUpdate } = useUpdater()

  const currentVersion = health.appVersion
  const hasUpdate = Boolean(update?.version)

  return (
    <div className="p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <HugeiconsIcon
              icon={SparklesIcon}
              className="size-4"
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Application & Releases
            </h2>
            <p className="text-xs text-muted-foreground">
              Installed runtime version and automatic updater channel
            </p>
          </div>
        </div>

        <Show
          when={hasUpdate}
          fallback={
            <Badge
              variant="secondary"
              className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-3"
              />
              Up to date
            </Badge>
          }
        >
          <Badge
            variant="default"
            className="text-[10px] gap-1 bg-primary text-primary-foreground font-semibold"
          >
            Update Available
          </Badge>
        </Show>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-md bg-muted/30 border border-border/30 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Version:</span>
            <span className="font-mono text-xs font-bold text-foreground">
              v{currentVersion}
            </span>
          </div>

          <Show when={hasUpdate && Boolean(update?.version)}>
            <p className="text-xs text-primary font-medium mt-1">
              New version v{update?.version} is ready to install!
            </p>
          </Show>
        </div>

        <Show when={hasUpdate}>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleInstallUpdate}
              disabled={isPending}
              className="h-8 text-xs gap-1.5"
            >
              <Show
                when={!isPending}
                fallback={<Spinner className="size-3.5" />}
              >
                <HugeiconsIcon
                  icon={DownloadIcon}
                  className="size-3.5"
                />
              </Show>
              <span>
                <Show
                  when={isPending}
                  fallback={`Install v${update?.version}`}
                >
                  <Show
                    when={progress.percentage > 0}
                    fallback="Updating..."
                  >
                    Updating {progress.percentage}%
                  </Show>
                </Show>
              </span>
            </Button>
          </div>
        </Show>
      </div>

      <Show when={isPending && progress.total > 0}>
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Download Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </Show>
    </div>
  )
}
