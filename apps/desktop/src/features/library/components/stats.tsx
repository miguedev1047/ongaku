import { useMemo } from 'react'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/features/library/queries'
import { playlistsQueryOpts } from '@/features/playlists/queries'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { formatPlaylistDuration } from '@/shared/helpers/total-tracks-hours'
import { NumberTicker } from '@/components/ui/number-ticker'

export function LibraryStats() {
  const { t } = useTranslation()
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  const totalTracksDuration = useMemo(
    () => formatPlaylistDuration(songs),
    [songs],
  )

  return (
    <div className='grid md:grid-cols-3 gap-4'>
      <CardWrapper className='@container/card'>
        <CardHeader>
          <CardDescription>{t('library.stats.tracks')}</CardDescription>
          <CardTitle size='metric'>
            <NumberTicker value={songs.length} delay={0.1} />
          </CardTitle>
        </CardHeader>
      </CardWrapper>
      <CardWrapper className='@container/card'>
        <CardHeader>
          <CardDescription>{t('library.stats.playlists')}</CardDescription>
          <CardTitle size='metric'>
            <NumberTicker value={playlists.length} delay={0.1} />
          </CardTitle>
        </CardHeader>
      </CardWrapper>
      <CardWrapper className='@container/card'>
        <CardHeader>
          <CardDescription>{t('library.stats.duration')}</CardDescription>
          <CardTitle size='metric'>{totalTracksDuration}</CardTitle>
        </CardHeader>
      </CardWrapper>
    </div>
  )
}
