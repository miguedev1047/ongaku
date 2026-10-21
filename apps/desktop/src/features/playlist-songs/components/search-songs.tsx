import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ongaku/ui'
import { SearchTrigger } from '@ongaku/ui'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { playlistSongsQueryOpts } from '@/features/playlist-songs/queries'
import { useActivePlayerStore } from '@/features/player/stores'
import { useTranslation } from 'react-i18next'
import { useSongUtils } from '@/hooks/use-song-utils'
import { CoverImage } from '@ongaku/ui'

export function SearchSongs() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { playlistName } = useParams({ from: '/playlists/$playlistName' })
  const { data: songs = [] } = useSuspenseQuery(
    playlistSongsQueryOpts(playlistName),
  )

  const playSong = useActivePlayerStore((state) => state.playSong)

   const { getCoverUrl } = useSongUtils()

  useHotkey('Control+K', () => setIsOpen(!isOpen))

  return (
    <div className='ml-auto flex items-center gap-2'>
      <SearchTrigger
        onClick={() => setIsOpen(true)}
        placeholder={t('playlists.search_songs_placeholder')}
      />
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} size='md'>
        <Command>
          <CommandInput
            placeholder={t('playlists.search_songs_command_placeholder')}
          />
          <CommandList>
            <CommandEmpty>
              {t('playlists.search_songs_command_empty')}
            </CommandEmpty>
            <CommandGroup>
              {songs.map((song) => {
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
                    value={song.name}
                    onSelect={handleSelectSong}
                  >
                    <div className='flex items-center gap-2 w-full'>
                      <figure className='size-8 shrink-0 rounded-md overflow-hidden bg-muted'>
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
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
