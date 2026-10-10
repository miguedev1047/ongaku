import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/shared/queries/library'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from '@/components/ui/card-wrapper'

export function LibraryStats() {
  const { t } = useTranslation()
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  return (
    <div className='grid md:grid-cols-2 gap-4'>
      <CardWrapper className='@container/card'>
        <CardHeader>
          <CardDescription>{t('library.stats.tracks')}</CardDescription>
          <CardTitle size='metric'>
            {songs.length}
          </CardTitle>
        </CardHeader>
      </CardWrapper>
      <CardWrapper className='@container/card'>
        <CardHeader>
          <CardDescription>{t('library.stats.playlists')}</CardDescription>
          <CardTitle size='metric'>
            {playlists.length}
          </CardTitle>
        </CardHeader>
      </CardWrapper>
    </div>
  )
}
