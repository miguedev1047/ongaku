import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCopySongTitle } from "@/blocks/song-actions/shared/use-copy-song-title"

interface CopySongMenuItemProps {
  title: string
}

export function CopySongMenuItem({ title }: CopySongMenuItemProps) {
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
      <span>Copy title</span>
    </DropdownMenuItem>
  )
}
