import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { createColumnHelper } from "@tanstack/react-table"
import type { SearchTableFeatures } from "@/components/blocks/search-songs-list/search-table-features"

const helper = createColumnHelper<SearchTableFeatures, TYoutubeSearchResult>()

export const searchSongColumns = helper.columns([
  helper.display({
    id: "select",
    header: "Select"
  }),
  helper.accessor("title", {
    id: "title",
    header: "Title"
  }),
  helper.accessor((row) => row.duration ?? 0, {
    id: "duration",
    header: "Time"
  }),
  helper.display({
    id: "actions",
    header: "Actions"
  })
])
