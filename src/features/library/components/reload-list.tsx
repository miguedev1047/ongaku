import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Show } from "@/components/utility/show"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { ReloadIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

import { useTranslation } from "react-i18next"

export function LibraryReloadList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { isPending, isRefetching, refetch } = useQuery(librarySongsQueryOpts())
  const isLoading = isPending || isRefetching

  const handleReload = async () => {
    try {
      await invoke("sync_library")
    } finally {
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries(playlistsQueryOpts())
      ])
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
        <p>{t("library.refresh_library")}</p>
      </TooltipContent>
    </Tooltip>
  )
}
