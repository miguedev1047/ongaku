import { VList } from "virtua"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { Checkbox } from "@/components/ui/checkbox"
import { useSearchBatchStore } from "@/shared/stores/use-search-batch"
import { SearchSongItem } from "@/blocks/search-songs-list/search-song-item"
import { SearchBatchBar } from "@/blocks/search-songs-list/search-batch-bar"

interface SearchSongsListProps {
  data: TYoutubeSearchResult[]
}

export function SearchSongsList({ data }: SearchSongsListProps) {
  const isAllSelected = useSearchBatchStore((s) => s.isAllSelected(data))
  const selectAll = useSearchBatchStore((s) => s.selectAll)

  return (
    <div className="size-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-border/40 text-xs text-muted-foreground select-none">
        <label className="flex items-center gap-2.5 cursor-pointer hover:text-foreground transition-colors">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => selectAll(data)}
            aria-label="Select all search results"
          />
          <span className="font-medium text-xs">Select all</span>
        </label>

        <span className="text-[11px] font-mono">
          {data.length} {data.length === 1 ? "result" : "results"}
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <VList
          data={data}
          className="size-full no-scrollbar scroll-fade-y"
        >
          {(item) => (
            <SearchSongItem
              key={item.id}
              item={item}
            />
          )}
        </VList>
      </div>

      <SearchBatchBar />
    </div>
  )
}
