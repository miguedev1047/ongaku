import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandVirtualList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useState } from "react"
import { useParams } from "@tanstack/react-router"
import { useHotkey } from "@tanstack/react-hotkeys"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"

export function SearchSongs() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { data: songs } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))
  const [isOpen, setIsOpen] = useState(false)
  const { getCoverUrl } = useSongUtils()

  const playSong = useActivePlayerStore((state) => state.playSong)

  useHotkey("Control+Alt+S", () => setIsOpen(!isOpen))

  return (
    <div className="flex flex-col gap-4">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
            >
              <HugeiconsIcon icon={Search01Icon} />
            </Button>
          }
        />
        <TooltipContent>
          Search songs
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Alt</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Command
          className="max-w-sm rounded-lg border"
          shouldFilter={false}
        >
          <CommandInput placeholder="Type a command or search..." />
          <CommandVirtualList
            data={songs}
            filter={(song, search) => {
              const query = search.toLowerCase()
              return (
                song.name.toLowerCase().includes(query) ||
                Boolean(song.metadata?.artist?.toLowerCase().includes(query))
              )
            }}
            className="h-[40vh]"
            heading="Search song"
          >
            {(song) => {
              const handleSelectSong = () => {
                setIsOpen(false)
                playSong(song)
              }

              return (
                <CommandItem
                  key={song.id}
                  value={song.id}
                  onSelect={handleSelectSong}
                >
                  <figure className="size-8 shrink-0">
                    <CoverImage
                      src={getCoverUrl({ song })}
                      alt={song.name}
                      className="size-full object-cover"
                    />
                  </figure>
                  <div>
                    <h2 className="line-clamp-1 text-sm">{song.name}</h2>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {song.metadata.artist}
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
