import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { WifiOff01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

interface YoutubeSearchOfflineProps {
  className?: string
}

export function YoutubeSearchOffline({ className }: YoutubeSearchOfflineProps) {
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
              icon={WifiOff01Icon}
              className="size-6 text-muted-foreground/70"
            />
          </EmptyMedia>
          <EmptyTitle>{t("youtube_search.offline.title")}</EmptyTitle>
          <EmptyDescription>
            {t("youtube_search.offline.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
