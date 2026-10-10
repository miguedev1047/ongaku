import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandVirtualList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Kbd } from '@/components/ui/kbd'
import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import { CoverImage } from '@/components/generic/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useActivePlayerStore } from '@/shared/stores/player'
import { useTranslation } from 'react-i18next'

export function SearchSongs() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { playlistName } = useParams({ from: '/playlists/$playlistName' })
  const { data: songs } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))

  const { getCoverUrl } = useSongUtils()

  const playSong = useActivePlayerStore((state) => state.playSong)

  useHotkey('Control+K', () => setIsOpen(!isOpen))

  return (
    <div className='ml-auto flex items-center gap-2'>
      <Button
        onClick={() => setIsOpen(true)}
        variant='outline'
        className='w-52'
        size='sm'
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className='size-4'
        />
        {t('playlists.search_songs_placeholder')}
        <Kbd className='ml-auto'>⌘K</Kbd>
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        size='md'
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('playlists.search_songs_command_placeholder')}
          />
          <CommandVirtualList
            data={songs}
            filter={(song, search) => {
              const query = search.toLowerCase()
              return (
                song.name.toLowerCase().includes(query) ||
                Boolean(song.metadata?.artist?.toLowerCase().includes(query))
              )
            }}
            estimateSize={47}
            style={{ maxHeight: '40vh' }}
            heading={t('playlists.search_songs_command_heading')}
          >
            {(song) => {
              const handleSelectSong = () => {
                setIsOpen(false)
                playSong(song, songs, {
                  type: 'playlist',
                  playlistName: playlistName || song.playlist_name || '',
                })
              }

              return (
                <CommandItem
                  key={song.id}
                  value={song.id}
                  onSelect={handleSelectSong}
                >
                  <figure className='size-8 shrink-0'>
                    <CoverImage
                      src={getCoverUrl({ song })}
                      alt={song.name}
                      className='size-full object-cover'
                    />
                  </figure>
                  <div>
                    <h2 className='line-clamp-1 text-sm'>{song.name}</h2>
                    <p className='text-xs text-muted-foreground line-clamp-1'>
                      {song.metadata.artist || t('common.unknown_artist')}
                    </p>
                  </div>
                </CommandItem>
              )
            }}
          </CommandVirtualList>
        </Command>
      </CommandDialog>
    </div>
  )
}
