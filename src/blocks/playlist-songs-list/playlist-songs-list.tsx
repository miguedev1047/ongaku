import { VList } from "virtua"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { Checkbox } from "@/components/ui/checkbox"
import { usePlaylistBatchStore } from "@/shared/stores/use-playlist-batch"
import { PlaylistSongItem } from "@/blocks/playlist-songs-list/playlist-song-item"
import { PlaylistBatchBar } from "@/blocks/playlist-songs-list/playlist-batch-bar"
import { FieldLabel } from "@/components/ui/field"

interface PlaylistSongsListProps {
  data: TPlaylistSong[]
  playlistName: string
}

export function PlaylistSongsList({
  data,
  playlistName
}: PlaylistSongsListProps) {
  const isAllSelected = usePlaylistBatchStore((s) => s.isAllSelected(data))
  const selectAll = usePlaylistBatchStore((s) => s.selectAll)

  return (
    <div className="size-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-border/40 text-xs text-muted-foreground select-none">
        <FieldLabel className="flex items-center gap-2.5 cursor-pointer hover:text-foreground transition-colors">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => selectAll(data)}
            aria-label="Select all songs"
          />
          <span className="font-medium text-xs">Select all</span>
        </FieldLabel>

        <span className="text-[11px] font-mono">
          {data.length} {data.length === 1 ? "song" : "songs"}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <VList
          data={data}
          className="size-full no-scrollbar scroll-fade-y"
        >
          {(song) => (
            <PlaylistSongItem
              key={song.id}
              song={song}
            />
          )}
        </VList>
      </div>

      <PlaylistBatchBar currentPlaylistName={playlistName} />
    </div>
  )
}
