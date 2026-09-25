import { toast } from "sonner"
import { useStreamingBatchStore } from "@/shared/stores/use-streaming-batch"
import { useDownloadsStore } from "@/shared/stores/use-downloads"

export function useStreamingBatchActions() {
  const selectedMap = useStreamingBatchStore((s) => s.selectedMap)
  const clearSelection = useStreamingBatchStore((s) => s.clear)
  const enqueue = useDownloadsStore((s) => s.enqueue)

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
