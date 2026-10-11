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
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/features/library/queries'
import { Kbd } from '@/components/ui/kbd'
import { useHotkey } from '@tanstack/react-hotkeys'
import { CoverImage } from '@/components/ui/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useActivePlayerStore } from '@/features/player/stores'
import { useTranslation } from 'react-i18next'

export function SearchLibrary() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  const { getCoverUrl } = useSongUtils()

  const playSong = useActivePlayerStore((state) => state.playSong)

  useHotkey('Control+K', () => setIsOpen(!isOpen))

  return (
    <div className='ml-auto flex items-center'>
      <Button
        onClick={() => setIsOpen(true)}
        variant='outline'
        className='w-52'
        size='sm'
      >
        <HugeiconsIcon icon={Search01Icon} className='size-4' />
        {t('library.header.search_placeholder')}
        <Kbd className='ml-auto'>⌘K</Kbd>
      </Button>
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
                    className='gap-2.5'
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
                        {song.metadata.artist || t('common.unknown_artist')}
                      </p>
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
