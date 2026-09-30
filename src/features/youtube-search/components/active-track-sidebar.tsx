import { Show } from '@/components/utility/show'
import { YoutubeSongInfo } from '@/features/youtube-search/components/youtube-song-info'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'

interface ActiveTrackSidebarProps {
  track: TYoutubeSearchResult | null
}

export function ActiveTrackSidebar({ track }: ActiveTrackSidebarProps) {
  return (
    <Show when={track}>
      <aside className='hidden md:flex w-72 lg:w-80 xl:w-96 h-full shrink-0 flex-col overflow-y-auto no-scrollbar'>
        <YoutubeSongInfo />
      </aside>
    </Show>
  )
}
