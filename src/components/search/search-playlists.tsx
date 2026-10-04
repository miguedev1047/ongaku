import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandShortcut,
  CommandVirtualList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Music01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { Kbd } from '@/components/ui/kbd'
import { useCallback, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Show } from '@/components/utility/show'
import type { TPlaylist } from '@/shared/types/playlist.types'
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
      value={playlist.id}
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      onSelect={handleNavigate}
      className='w-full flex! flex-row! justify-between'
    >
      <HugeiconsIcon icon={Music01Icon} />
      <span className='truncate'>{playlist.name}</span>

      <CommandShortcut className='flex items-center gap-1'>
        <p className='ml-auto text-[11px] text-muted-foreground font-mono'>
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
      <Button
        onClick={() => setIsOpen(true)}
        variant='outline'
        size='sm'
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className='size-4'
        />
        {t('playlists.search_placeholder')}
        <Kbd className='ml-auto'>⌘K</Kbd>
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Command
          className='max-w-sm rounded-lg border'
          shouldFilter={false}
        >
          <CommandInput
            placeholder={t('playlists.search_command_placeholder')}
          />
          <CommandVirtualList
            data={playlists}
            filter={(playlist, search) => {
              const query = search.toLowerCase()
              const nameMatch = playlist.name.toLowerCase().includes(query)

              return nameMatch
            }}
            className='h-[40vh]'
            heading={t('playlists.search_command_heading')}
          >
            {(playlist) => (
              <SearchPlaylistItem
                key={playlist.id}
                playlist={playlist}
                onSelect={() => setIsOpen(false)}
              />
            )}
          </CommandVirtualList>
        </Command>
      </CommandDialog>
    </div>
  )
}
