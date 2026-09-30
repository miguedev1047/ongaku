import { useSuspenseQuery } from "@tanstack/react-query"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { binariesCheckQueryOpts } from "@/shared/queries/binaries"
import { Show } from "@/components/utility/show"

interface PlaylistMenuGroupProps {
  onSelectPlaylist: (playlistName: string) => void
  disabled?: boolean
}

export function PlaylistMenuGroup({
  onSelectPlaylist,
  disabled
}: PlaylistMenuGroupProps) {
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())
  const { data: isBinariesInstalled } = useSuspenseQuery(
    binariesCheckQueryOpts()
  )

  const hasPlaylists = playlists.length > 0

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Playlists</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <Show
        when={hasPlaylists}
        fallback={
          <DropdownMenuItem
            disabled
            className="text-xs text-muted-foreground"
          >
            No playlists found
          </DropdownMenuItem>
        }
      >
        {playlists.map((playlist) => (
          <DropdownMenuItem
            key={playlist.id}
            onClick={() => onSelectPlaylist(playlist.name)}
            disabled={disabled || !isBinariesInstalled}
            className="flex items-center gap-2 cursor-pointer text-xs"
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className="size-3.5 text-muted-foreground"
            />
            <span className="truncate">{playlist.name}</span>
          </DropdownMenuItem>
        ))}
      </Show>
    </DropdownMenuGroup>
  )
}
