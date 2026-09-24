import { youtubeSearchQueryOpts } from "@/shared/queries/youtube"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { SearchYoutubeItem } from "@/features/youtube-search/components"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { ListIcon } from "@hugeicons/core-free-icons"

export function SearchYoutubeList() {
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
            <EmptyTitle>No results</EmptyTitle>
            <EmptyDescription>There are no songs results</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const renderItems = results.map((item) => (
    <SearchYoutubeItem
      key={item.id}
      item={item}
    />
  ))

  return <ul className="space-y-1">{renderItems}</ul>
}
