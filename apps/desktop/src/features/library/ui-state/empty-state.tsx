import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

export interface LibraryEmptyStateProps {
  className?: string
}

export function LibraryEmptyState({ className }: LibraryEmptyStateProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "size-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground select-none",
        className
      )}
    >
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={MusicNote01Icon} />
          </EmptyMedia>
          <EmptyTitle>{t("library.empty.title")}</EmptyTitle>
          <EmptyDescription>
            {t("library.empty.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
