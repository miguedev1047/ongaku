import { useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { SearchTrigger } from '@/components/ui/search-trigger'
import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/features/library/queries'
import { useHotkey } from '@tanstack/react-hotkeys'
import { CoverImage } from '@/components/ui/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useActivePlayerStore } from '@/features/player/stores'
import { useTranslation } from 'react-i18next'
import { Show } from '@/components/utility/show'

export function SearchLibrary() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  const { getCoverUrl } = useSongUtils()

  const playSong = useActivePlayerStore((state) => state.playSong)

  useHotkey('Control+K', () => setIsOpen(!isOpen))

  return (
    <div className='ml-auto flex items-center'>
      <SearchTrigger
        onClick={() => setIsOpen(true)}
        placeholder={t('library.header.search_placeholder')}
      />
      <Show when={isOpen}>
        <CommandDialog open={isOpen} onOpenChange={setIsOpen} size='md'>
          <Command>
            <CommandInput placeholder={t('library.search_command_placeholder')} />
            <CommandList>
              <CommandEmpty>{t('library.search_command_empty')}</CommandEmpty>
              <CommandGroup>
                {songs.map((song) => {
                  const handleSelectSong = () => {
                    setIsOpen(false)
                    playSong(song, songs, { type: 'library' })
                  }

                  return (
                    <CommandItem
                      key={song.id}
                      value={song.id}
                      onSelect={handleSelectSong}
                    >
                      <figure className='size-8 shrink-0 rounded-md overflow-hidden bg-muted'>
                        <CoverImage
                          src={getCoverUrl({ song })}
                          alt={song.name}
                          className='size-full object-cover'
                        />
                      </figure>
                      <div className='flex-1 min-w-0'>
                        <h2 className='line-clamp-1 text-sm font-medium'>
                          {song.name}
                        </h2>
                        <p className='text-xs text-muted-foreground line-clamp-1'>
                          {song.metadata?.artist || t('common.unknown_artist')}
                        </p>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </Show>
    </div>
  )
}
