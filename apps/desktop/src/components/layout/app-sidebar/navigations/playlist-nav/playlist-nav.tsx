import { SidebarMenuButton, SidebarMenuItem } from '@ongaku/ui'
import { ACTIVE_ROUTE } from '@ongaku/ui'
import { FolderIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function PlaylistNav() {
  const { t } = useTranslation()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t('sidebar.playlists')}
        render={
          <Link
            to='/playlists'
            activeOptions={{ includeHash: true }}
            activeProps={{ className: ACTIVE_ROUTE }}
          />
        }
      >
        <HugeiconsIcon icon={FolderIcon} className='size-4 shrink-0' />
        <span className='truncate'>{t('sidebar.playlists')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
