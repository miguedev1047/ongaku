import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Show } from "@/components/utility/show"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { ReloadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

export function PlaylistsReloadList() {
  const { isPending, isRefetching, refetch } = useQuery(playlistsQueryOpts())
  const isLoading = isPending || isRefetching

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            size="icon-sm"
          >
            <Show
              when={isLoading}
              fallback={<HugeiconsIcon icon={ReloadIcon} />}
            >
              <Spinner />
            </Show>
          </Button>
        }
      />
      <TooltipContent>
        <p>Refresh playlists</p>
      </TooltipContent>
    </Tooltip>
  )
}
