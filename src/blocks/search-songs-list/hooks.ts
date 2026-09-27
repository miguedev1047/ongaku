import { useSearchBatchStore } from "@/shared/stores/batch-operations"
import { useDownloadQueueStore } from "@/shared/stores/actions"

export function useSearchBatchActions() {
  const selectedMap = useSearchBatchStore((s) => s.selectedMap)
  const clearSelection = useSearchBatchStore((s) => s.clear)
  const enqueue = useDownloadQueueStore((s) => s.enqueue)

  const selectedSongs = Object.values(selectedMap)
  const selectedCount = selectedSongs.length

  const handleBatchDownload = (playlistName: string) => {
    if (selectedSongs.length === 0 || !playlistName) return

    enqueue(
      selectedSongs.map((item) => ({
        item,
        playlistName
      }))
    )

    clearSelection()
  }

  return {
    selectedSongs,
    selectedCount,
    clearSelection,
    handleBatchDownload
  }
}
