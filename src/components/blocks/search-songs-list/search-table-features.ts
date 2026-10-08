import {
  tableFeatures,
  rowSelectionFeature,
  rowSortingFeature,
  createSortedRowModel
} from "@tanstack/react-table"

export const searchTableFeatures = tableFeatures({
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel()
})

export type SearchTableFeatures = typeof searchTableFeatures
