import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { LibraryIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function LibraryNav() {
  const { t } = useTranslation()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t('sidebar.library')}
        render={
          <Link
            to='/library'
            activeOptions={{ exact: true }}
            activeProps={{ className: 'bg-accent' }}
          />
        }
      >
        <HugeiconsIcon
          icon={LibraryIcon}
          className='size-4 shrink-0'
        />
        <span className='truncate'>{t('sidebar.library')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
