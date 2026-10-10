import { cn } from 'cn'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { useAppStatus } from '@/features/settings/hooks'
import {
  StatusIcon,
  StatusBadge,
  CollapsedIndicator,
} from '@/components/blocks/app-sidebar/components/settings-nav-status'
import { useTranslation } from 'react-i18next'
import { ACTIVE_ROUTE } from '@/constants/styles'

export function SettingsNav() {
  const { t } = useTranslation()
  const { status, badgeText, tooltipText } = useAppStatus()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={tooltipText || t('sidebar.settings')}
        render={
          <Link
            to='/settings'
            activeOptions={{ exact: false }}
            activeProps={{ className: ACTIVE_ROUTE }}
          />
        }
        className={cn(
          'relative',
          status === 'error' && 'text-destructive hover:text-destructive',
          status === 'update' && 'text-primary hover:text-primary',
        )}
      >
        <StatusIcon status={status} />
        <span className='truncate'>{t('sidebar.settings')}</span>
        <StatusBadge status={status} badgeText={badgeText} />
        <CollapsedIndicator status={status} />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
