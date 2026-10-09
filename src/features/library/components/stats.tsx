import {
  Card,
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
      <CardWrapper className='@container/card bg-card/60'>
        <CardHeader>
          <CardDescription>{t('library.stats.tracks')}</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {songs.length}
          </CardTitle>
        </CardHeader>
      </CardWrapper>
      <CardWrapper className='@container/card bg-card/60'>
        <CardHeader>
          <CardDescription>{t('library.stats.playlists')}</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {playlists.length}
          </CardTitle>
        </CardHeader>
      </CardWrapper>
    </div>
  )
}
