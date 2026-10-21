import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@ongaku/ui'
import { useTranslation } from 'react-i18next'
import { YoutubeSearchNav } from '@/components/layout/app-sidebar/navigations/youtube-search-nav'
import { PlaylistNav } from '@/components/layout/app-sidebar/navigations/playlist-nav'
import { LibraryNav } from '@/components/layout/app-sidebar/navigations/library-nav'
import { DownloadSongsNav } from '@/components/layout/app-sidebar/navigations/download-songs-nav'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { Show } from '@ongaku/ui'

export function AppSidebarNav() {
  const { t } = useTranslation()
  const { data: health } = useQuery(systemHealthQueryOpts())

  const binaries =
    health?.binariesInstalled ??
    (health?.ytdlpInstalled && health?.ffmpegInstalled)
  const isBinariesInstalled = Boolean(binaries)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('sidebar.navigation.label')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <PlaylistNav />
          <LibraryNav />
          <Show when={isBinariesInstalled}>
            <DownloadSongsNav />
            <YoutubeSearchNav />
          </Show>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
