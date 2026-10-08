import { useQuery } from '@tanstack/react-query'
import { updatesQueryOpts } from '@/shared/queries/updates'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useTranslation } from 'react-i18next'

export type AppStateStatus = 'idle' | 'update' | 'error'

export interface AppStatusResult {
  status: AppStateStatus
  badgeText?: string
  tooltipText: string
  hasUpdate: boolean
  hasError: boolean
  updateVersion?: string
  errorReasons: string[]
}

export function useAppStatus(): AppStatusResult {
  const { t } = useTranslation()
  const { data: update } = useQuery(updatesQueryOpts())
  const { data: health } = useQuery(systemHealthQueryOpts())

  const errorReasons: string[] = []

  // Check 1: Server health
  if (health && !health.serverHealthy) {
    errorReasons.push('Internal audio streaming server is offline')
  }

  // Check 2: Directory permissions and existence
  if (health?.directories) {
    for (const dir of health.directories) {
      if (!dir.exists) {
        errorReasons.push(`Directory missing: ${dir.name}`)
      } else if (!dir.writable) {
        errorReasons.push(`Directory not writable: ${dir.name}`)
      }
    }
  }

  const hasError = errorReasons.length > 0
  const hasUpdate = Boolean(update?.version)

  if (hasError) {
    return {
      status: 'error',
      badgeText: t('settings.status_badge_issue'),
      tooltipText:
        errorReasons.length === 1
          ? t('settings.status_tooltip_issues', { count: errorReasons.length })
          : t('settings.status_tooltip_issues_plural', {
              count: errorReasons.length,
            }),
      hasError: true,
      hasUpdate,
      updateVersion: update?.version,
      errorReasons,
    }
  }

  if (hasUpdate && update) {
    return {
      status: 'update',
      badgeText: `v${update.version}`,
      tooltipText: t('settings.status_tooltip_update', {
        version: update.version,
      }),
      hasError: false,
      hasUpdate: true,
      updateVersion: update.version,
      errorReasons: [],
    }
  }

  return {
    status: 'idle',
    badgeText: undefined,
    tooltipText: t('settings.status_tooltip_idle'),
    hasError: false,
    hasUpdate: false,
    updateVersion: undefined,
    errorReasons: [],
  }
}
