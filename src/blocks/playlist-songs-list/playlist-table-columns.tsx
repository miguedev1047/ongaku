import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { createColumnHelper } from "@tanstack/react-table"
import type { PlaylistTableFeatures } from "@/blocks/playlist-songs-list/playlist-table-features"

const helper = createColumnHelper<PlaylistTableFeatures, TPlaylistSong>()

export const playlistSongColumns = helper.columns([
  helper.display({
    id: "select",
    header: "Select"
  }),
  helper.accessor("name", {
    id: "name",
    header: "Title"
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
