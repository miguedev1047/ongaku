import { toast } from "sonner"
import { useSearchBatchStore } from "@/shared/stores/use-search-batch"
import { useDownloadQueueStore } from "@/shared/stores/use-download-queue"

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

    toast.success(
      selectedCount === 1
        ? `Added 1 song to download queue for "${playlistName}"`
        : `Added ${selectedCount} songs to download queue for "${playlistName}"`
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
