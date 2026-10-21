import { Button } from '@ongaku/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { MusicIcon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function SongEmpty() {
  const { t } = useTranslation()

  return (
    <div className='size-full flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 bg-background'>
      <div className='size-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground'>
        <HugeiconsIcon icon={MusicIcon} className='size-8' />
      </div>

      <div className='space-y-1 max-w-sm'>
        <h2 className='text-sm font-semibold text-foreground'>
          {t('player.now_playing', 'Now Playing')}
        </h2>
        <p className='text-xs text-muted-foreground'>
          {t('playlists.card.empty', 'No song is currently playing. Start playback from your library or playlists.')}
        </p>
      </div>

      <div className='flex items-center gap-2 mt-2'>
        <Button size='sm' variant='outline' render={<Link to='/library' />}>
          {t('sidebar.navigation.routes.library', 'Library')}
        </Button>
        <Button size='sm' variant='default' render={<Link to='/playlists' />}>
          {t('playlists.header.title', 'Playlists')}
        </Button>
      </div>
    </div>
  )
}
