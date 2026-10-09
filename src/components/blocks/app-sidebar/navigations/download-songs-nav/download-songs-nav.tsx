import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Download02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function DownloadSongsNav() {
  const { t } = useTranslation()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t('sidebar.download_songs')}
        render={
          <Link
            to='/download-songs'
            activeOptions={{ includeHash: true }}
            activeProps={{ className: 'bg-accent' }}
          />
        }
      >
        <HugeiconsIcon
          icon={Download02Icon}
          className='size-4 shrink-0'
        />
        <span className='truncate'>{t('sidebar.download_songs')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
