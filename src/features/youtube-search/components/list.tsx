import { youtubeSearchQueryOpts } from "@/shared/queries/youtube"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { SearchYoutubeItem } from "@/features/youtube-search/components"

export function SearchYoutubeList() {
  const { q } = useSearch({ from: "/search-youtube/" })
  const { data: results = [] } = useSuspenseQuery(youtubeSearchQueryOpts(q))

  if (results.length === 0) {
    return <p>No results available</p>
  }

  const renderItems = results.map((item) => (
    <SearchYoutubeItem
      key={item.id}
      item={item}
    />
  ))

  return <ul className="space-y-1">{renderItems}</ul>
}
