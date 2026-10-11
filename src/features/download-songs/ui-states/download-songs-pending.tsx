import { RoutePendingState } from '@/components/feedback/route-ui-state'
import { useTranslation } from 'react-i18next'

export function DownloadSongsPending() {
  const { t } = useTranslation()
  return (
    <RoutePendingState
      title={t('routes.downloads.pending_title')}
      message={t('routes.downloads.pending_message')}
    />
  )
}
