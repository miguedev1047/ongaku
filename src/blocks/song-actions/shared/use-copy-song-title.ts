import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export function useCopySongTitle() {
  const { t } = useTranslation()

  const copySongTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title)
      toast.success(t("toasts.songs.copied_title"))
    } catch {
      toast.error(t("toasts.songs.copy_error"))
    }
  }

  return { copySongTitle }
}
