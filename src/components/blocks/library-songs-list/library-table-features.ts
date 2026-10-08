import {
  tableFeatures,
  rowSelectionFeature,
  rowSortingFeature,
  createSortedRowModel
} from "@tanstack/react-table"

export const libraryTableFeatures = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel()
})

export type LibraryTableFeatures = typeof libraryTableFeatures
