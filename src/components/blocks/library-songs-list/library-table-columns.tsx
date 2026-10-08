import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { createColumnHelper } from "@tanstack/react-table"
import type { LibraryTableFeatures } from "@/components/blocks/library-songs-list/library-table-features"

const helper = createColumnHelper<LibraryTableFeatures, TPlaylistSong>()

export const librarySongColumns = helper.columns([
  helper.display({
    id: "select",
    header: "Select"
  }),
  helper.display({
    id: "cover",
    header: "Cover"
  }),
  helper.accessor("name", {
    id: "name",
    header: "Title"
  }),
  helper.accessor((row) => row.metadata?.artist || "Unknown Artist", {
    id: "artist",
    header: "Artist"
  }),
  helper.accessor((row) => row.metadata?.album || "Unknown Album", {
    id: "album",
    header: "Album"
  }),
  helper.accessor((row) => row.metadata?.duration ?? 0, {
    id: "duration",
    header: "Time"
  }),
  helper.display({
    id: "actions",
    header: "Actions"
  })
])
