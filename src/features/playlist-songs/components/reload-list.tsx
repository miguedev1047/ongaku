import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Show } from "@/components/utility/show"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { ReloadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { platformService } from "@/infrastructure/platform"
import { useTranslation } from "react-i18next"

export function PlaylistSongsReloadList() {
  const { t } = useTranslation()
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { isPending, isRefetching, refetch } = useQuery(
    playlistSongsQueryOpts(playlistName)
  )
  const isLoading = isPending || isRefetching

  const handleReload = async () => {
    try {
      await platformService.invoke("sync_library")
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
        <p>{t('common.refresh')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
