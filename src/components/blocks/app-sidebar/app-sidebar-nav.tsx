import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { useTranslation } from 'react-i18next'
import { YoutubeSearchNav } from '@/components/blocks/app-sidebar/navigations/youtube-search-nav'
import { PlaylistNav } from '@/components/blocks/app-sidebar/navigations/playlist-nav'
import { LibraryNav } from '@/components/blocks/app-sidebar/navigations/library-nav'
import { DownloadSongsNav } from '@/components/blocks/app-sidebar/navigations/download-songs-nav'

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
