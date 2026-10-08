import {
  tableFeatures,
  rowSelectionFeature,
  rowSortingFeature,
  createSortedRowModel
} from "@tanstack/react-table"

export const playlistTableFeatures = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel()
})

export type PlaylistTableFeatures = typeof playlistTableFeatures
