import { useState } from "react"
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
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { Kbd } from "@/components/ui/kbd"
import { useHotkey } from "@tanstack/react-hotkeys"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { useActivePlayerStore } from "@/shared/stores/player"

export function SearchLibrary() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  const { getCoverUrl } = useSongUtils()

  const playSong = useActivePlayerStore((state) => state.playSong)

  useHotkey("Control+K", () => setIsOpen(!isOpen))

  return (
    <div className="ml-auto flex items-center">
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-52"
        size="sm"
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className="size-4"
        />
        Search songs...
        <Kbd className="ml-auto">⌘K</Kbd>
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Command
          className="max-w-md rounded-lg border"
          shouldFilter={false}
        >
          <CommandInput placeholder="Type a song, artist, or album..." />
          <CommandVirtualList
            data={songs}
            filter={(song, search) => {
              const query = search.toLowerCase()
              const nameMatch = song.name.toLowerCase().includes(query)
              const artistMatch = Boolean(
                song.metadata?.artist?.toLowerCase().includes(query)
              )
              const albumMatch = Boolean(
                song.metadata?.album?.toLowerCase().includes(query)
              )
              return nameMatch || artistMatch || albumMatch
            }}
            className="h-[40vh]"
            heading="Search library songs"
          >
            {(song) => {
              const handleSelectSong = () => {
                setIsOpen(false)
                playSong(song, songs, { type: "library" })
              }

              return (
                <CommandItem
                  key={song.id}
                  value={song.id}
                  onSelect={handleSelectSong}
                  className="gap-2.5"
                >
                  <figure className="size-8 shrink-0 rounded-md overflow-hidden bg-muted">
                    <CoverImage
                      src={getCoverUrl({ song })}
                      alt={song.name}
                      className="size-full object-cover"
                    />
                  </figure>
                  <div className="flex-1 min-w-0">
                    <h2 className="line-clamp-1 text-sm font-medium">
                      {song.name}
                    </h2>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {song.metadata.artist || "Unknown Artist"}
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
