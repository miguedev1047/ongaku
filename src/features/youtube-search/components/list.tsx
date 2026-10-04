import { youtubeSearchQueryOpts } from "@/shared/queries/youtube"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { SearchSongsList } from "@/blocks/search-songs-list"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListIcon } from "@hugeicons/core-free-icons"
import { useTranslation } from "react-i18next"

export function SearchYoutubeList() {
  const { t } = useTranslation()
  const { q } = useSearch({ from: "/search-youtube/" })

  const { data: results = [] } = useSuspenseQuery(youtubeSearchQueryOpts(q))

  if (!results.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={ListIcon} />
            </EmptyMedia>
            <EmptyTitle>{t("youtube_search.no_results")}</EmptyTitle>
            <EmptyDescription>{t("youtube_search.no_results_desc")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return <SearchSongsList data={results} />
}
