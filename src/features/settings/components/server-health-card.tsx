import { Badge } from "@/components/ui/badge"
import { CardWrapper } from "@/components/ui/card-wrapper"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudServerIcon, CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { Show } from "@/components/utility/show"
import { useSuspenseQuery } from "@tanstack/react-query"
import { systemHealthQueryOpts } from "@/shared/queries/system-health"
import { useTranslation } from "react-i18next"

export function ServerHealthCard() {
  const { t } = useTranslation()
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())

  const isHealthy = health.serverHealthy && health.serverPort > 0
  const port = health.serverPort
  const host = health.serverHost
  const url = `http://${host}:${port}`

  return (
    <CardWrapper spacing='compact'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <HugeiconsIcon
              icon={CloudServerIcon}
              className="size-4"
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t('settings.tabs.system.server_health.title')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('settings.tabs.system.server_health.description')}
            </p>
          </div>
        </div>

        <Show
          when={isHealthy}
          fallback={
            <Badge
              variant="destructive"
              className="text-[10px] gap-1"
            >
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-3"
              />
              {t('settings.tabs.system.server_health.status.offline')}
            </Badge>
          }
        >
          <Badge
            variant="secondary"
            className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-3"
            />
            {t('settings.tabs.system.server_health.status.online')}
          </Badge>
        </Show>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-md bg-muted/40 border border-border/30">
          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">
            {t('settings.tabs.system.server_health.binding_host')}
          </span>
          <span className="font-mono font-medium text-foreground mt-0.5 block">
            {host}
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-muted/40 border border-border/30">
          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">
            {t('settings.tabs.system.server_health.allocated_port')}
          </span>
          <span className="font-mono font-medium text-foreground mt-0.5 block">
            {port}
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-muted/40 border border-border/30">
          <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">
            {t('settings.tabs.system.server_health.base_endpoint')}
          </span>
          <span className="font-mono font-medium text-foreground mt-0.5 block truncate" title={url}>
            {url}
          </span>
        </div>
      </div>
    </CardWrapper>
  )
}
