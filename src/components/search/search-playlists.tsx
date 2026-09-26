import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandVirtualList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Music01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { useSuspenseQuery } from "@tanstack/react-query"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useHotkey } from "@tanstack/react-hotkeys"

interface SearchPlaylistsProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function SearchPlaylists({
  open: externalOpen,
  onOpenChange: setExternalOpen,
  showTrigger = true
}: SearchPlaylistsProps = {}) {
  const { data: playlists } = useSuspenseQuery(playlistsQueryOpts())
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const isOpen = isControlled ? externalOpen : internalOpen
  const setIsOpen = (next: boolean) => {
    if (isControlled) {
      setExternalOpen?.(next)
    } else {
      setInternalOpen(next)
    }
  }

  const navigate = useNavigate()

  useHotkey("Control+Alt+P", () => setIsOpen(!isOpen))

  const commandDialog = (
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
          data={playlists}
          filter={(playlist, search) =>
            playlist.name.toLowerCase().includes(search.toLowerCase())
          }
          className="h-[40vh]"
          heading="Search playlist"
        >
          {(playlist) => (
            <CommandItem
              key={playlist.id}
              value={playlist.id}
              onSelect={() => {
                navigate({
                  to: "/playlists/$playlistName",
                  params: { playlistName: playlist.name }
                })
                setIsOpen(false)
              }}
            >
              <HugeiconsIcon icon={Music01Icon} />
              {playlist.name}
            </CommandItem>
          )}
        </CommandVirtualList>
      </Command>
    </CommandDialog>
  )

  if (!showTrigger) {
    return commandDialog
  }

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
          Search playlist
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Alt</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
      {commandDialog}
    </div>
  )
}
