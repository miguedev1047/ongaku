import { useSuspenseQuery } from "@tanstack/react-query"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { PlaylistItem } from "@/features/playlists/components/item"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

export function PlaylistList() {
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  if (playlists.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={FolderIcon} />
            </EmptyMedia>
            <EmptyTitle>No playlists found</EmptyTitle>
            <EmptyDescription>
              Create a new playlist to organize your music library
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-10 pt-12 pb-12 px-2">
      {playlists.map((playlist) => (
        <PlaylistItem
          key={playlist.id}
          playlist={playlist}
        />
      ))}
    </div>
  )
}
