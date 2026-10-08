import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCopySongTitle } from "@/components/blocks/song-actions/shared/use-copy-song-title"

import { useTranslation } from "react-i18next"

interface CopySongMenuItemProps {
  title: string
}

export function CopySongMenuItem({ title }: CopySongMenuItemProps) {
  const { t } = useTranslation()
  const { copySongTitle } = useCopySongTitle()

  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.stopPropagation()
        copySongTitle(title)
      }}
      className="cursor-pointer"
    >
      <HugeiconsIcon icon={Copy01Icon} />
      <span>{t('playlists.actions.copy_title')}</span>
    </DropdownMenuItem>
  )
}
