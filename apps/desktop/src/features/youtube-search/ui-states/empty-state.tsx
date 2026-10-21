import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

interface YoutubeSearchEmptyProps {
  className?: string
}

export function YoutubeSearchEmpty({ className }: YoutubeSearchEmptyProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground",
        className
      )}
    >
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              icon={YoutubeIcon}
              className="size-6 text-muted-foreground/70"
            />
          </EmptyMedia>
          <EmptyTitle>{t("youtube_search.empty.title")}</EmptyTitle>
          <EmptyDescription>
            {t("youtube_search.empty.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
