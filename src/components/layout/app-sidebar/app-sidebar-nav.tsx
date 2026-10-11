import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { useTranslation } from 'react-i18next'
import { YoutubeSearchNav } from '@/components/layout/app-sidebar/navigations/youtube-search-nav'
import { PlaylistNav } from '@/components/layout/app-sidebar/navigations/playlist-nav'
import { LibraryNav } from '@/components/layout/app-sidebar/navigations/library-nav'
import { DownloadSongsNav } from '@/components/layout/app-sidebar/navigations/download-songs-nav'

export function AppSidebarNav() {
  const { t } = useTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('sidebar.navigation.label')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <PlaylistNav />
          <LibraryNav />
          <DownloadSongsNav />
          <YoutubeSearchNav />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
