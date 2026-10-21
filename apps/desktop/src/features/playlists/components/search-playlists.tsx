import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@ongaku/ui'
import { SearchTrigger } from '@ongaku/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { Music01Icon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { playlistsQueryOpts } from '@/features/playlists/queries'
import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Show } from '@ongaku/ui'
import type { TPlaylist } from '@/features/playlists/types'
import { useTranslation } from 'react-i18next'

interface SearchPlaylistItemProps {
  playlist: TPlaylist
  onSelect: () => void
}

function SearchPlaylistItem({ playlist, onSelect }: SearchPlaylistItemProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const navigate = useNavigate()

  const handlePreload = useCallback(() => {
    router.preloadRoute({
      to: '/playlists/$playlistName',
      params: { playlistName: playlist.name },
    })
  }, [router, playlist.name])

  const handleNavigate = useCallback(() => {
    navigate({
      to: '/playlists/$playlistName',
      params: { playlistName: playlist.name },
    })
    onSelect()
  }, [navigate, onSelect, playlist.name])

  return (
    <CommandItem
      value={playlist.name}
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      onSelect={handleNavigate}
    >
      <div className='flex items-center gap-2 w-full'>
        <div className='p-2 bg-accent rounded-md'>
          <HugeiconsIcon icon={Music01Icon} />
        </div>
        <span className='truncate'>{playlist.name}</span>
        <CommandShortcut className='flex items-center ml-auto'>
          <p className='ml-auto text-xs text-muted-foreground font-mono'>
            <Show
              when={playlist.tracks === 1}
              fallback={
                <>
                  {t('playlists.card.tracks_count_plural', {
                    count: playlist.tracks,
                  })}
                </>
              }
            >
              {t('playlists.card.tracks_count', { count: playlist.tracks })}
            </Show>
          </p>
        </CommandShortcut>
      </div>
    </CommandItem>
  )
}

export function SearchPlaylists() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { data: playlists } = useSuspenseQuery(playlistsQueryOpts())

  useHotkey('Control+K', () => setIsOpen(!isOpen))

  return (
    <div className='ml-auto flex items-center gap-2'>
      <SearchTrigger
        onClick={() => setIsOpen(true)}
        placeholder={t('playlists.search_placeholder')}
      />
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} size='md'>
        <Command>
          <CommandInput
            placeholder={t('playlists.search_command_placeholder')}
          />
          <CommandList>
            <CommandEmpty>{t('playlists.search_command_empty')}</CommandEmpty>
            <CommandGroup>
              {playlists.map((playlist) => (
                <SearchPlaylistItem
                  key={playlist.id}
                  playlist={playlist}
                  onSelect={() => setIsOpen(false)}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
