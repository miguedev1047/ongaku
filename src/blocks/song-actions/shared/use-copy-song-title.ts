import { toast } from "sonner"

export function useCopySongTitle() {
  const copySongTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title)
      toast.success("Song title copied to clipboard")
    } catch {
      toast.error("Failed to copy song title to clipboard")
    }
  }

  return { copySongTitle }
}
