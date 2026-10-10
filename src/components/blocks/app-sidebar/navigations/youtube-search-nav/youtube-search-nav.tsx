import { Link } from '@tanstack/react-router'
import {
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { YoutubeIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useYoutubeSearchStore } from '@/shared/stores/actions'
import { useTranslation } from 'react-i18next'
import { ACTIVE_ROUTE } from '@/constants/styles'

export function YoutubeSearchNav() {
  const { t } = useTranslation()
  const lastQuery = useYoutubeSearchStore((state) => state.lastQuery)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t('sidebar.search')}
        render={
          <Link
            to='/search-youtube'
            search={{ q: lastQuery || '' }}
            activeOptions={{ includeSearch: false, exact: true }}
            activeProps={{ className: ACTIVE_ROUTE }}
          />
        }
      >
        <HugeiconsIcon icon={YoutubeIcon} className='size-4 shrink-0' />
        <span className='truncate'>{t('sidebar.search')}</span>
        <SidebarMenuBadge>
          <Badge variant='destructive' size='xs'>
            {t('common.alpha')}
          </Badge>
        </SidebarMenuBadge>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
