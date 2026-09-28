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
import { invoke } from "@tauri-apps/api/core"

export function PlaylistsReloadList() {
  const { isPending, isRefetching, refetch } = useQuery(playlistsQueryOpts())
  const isLoading = isPending || isRefetching

  const handleReload = async () => {
    try {
      await invoke("sync_library")
    } finally {
      await refetch()
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            onClick={handleReload}
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
