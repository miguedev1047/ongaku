import { toast } from "sonner"
import { useTranslation } from "react-i18next"

import { platformService } from "@/infrastructure/platform"

export function useCopySongTitle() {
  const { t } = useTranslation()

  const copySongTitle = async (title: string) => {
    try {
      await platformService.writeClipboard(title)
      toast.success(t("toasts.songs.copied_title"))
    } catch {
      toast.error(t("toasts.songs.copy_error"))
    }
  }

  return { copySongTitle }
}
