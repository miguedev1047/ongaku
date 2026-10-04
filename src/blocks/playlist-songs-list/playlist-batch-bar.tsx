import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { useActivePlayerStore } from "@/shared/stores/player"
import { usePlaylistBatchActions } from "@/blocks/playlist-songs-list/hooks"
import { BatchDeleteDialog } from "@/blocks/playlist-songs-list/batch-delete-dialog"
import { BatchMoveDialog } from "@/blocks/playlist-songs-list/batch-move-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Delete01Icon,
  Folder01Icon
} from "@hugeicons/core-free-icons"
import { cn } from "cn"
import { useTranslation } from "react-i18next"
import { Show } from "@/components/utility/show"

interface PlaylistBatchBarProps {
  currentPlaylistName?: string
}

export function PlaylistBatchBar({
  currentPlaylistName
}: PlaylistBatchBarProps) {
  const { t } = useTranslation()
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  const clearSelection = usePlaylistBatchStore((s) => s.clear)

  const {
    selectedCount,
    isMoveOpen,
    setIsMoveOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isProcessing,
    handleBatchDelete,
    handleBatchMove
  } = usePlaylistBatchActions(currentPlaylistName)

  if (selectedCount === 0) {
    return null
  }

  const bottomClass = activePlayer ? "bottom-24" : "bottom-6"

  return createPortal(
    <>
      <div
        className={cn(
          `fixed left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-lg px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`,
          bottomClass
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            <Show
              when={selectedCount === 1}
              fallback={t("playlists.batch.selected_plural", { count: selectedCount })}
            >
              {t("playlists.batch.selected", { count: selectedCount })}
            </Show>
          </span>

          <Button
            size="icon"
            variant="ghost"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={clearSelection}
            title={t("playlists.batch.deselect_all")}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-3.5"
            />
          </Button>
        </div>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs font-medium"
            onClick={() => setIsMoveOpen(true)}
          >
            <HugeiconsIcon
              icon={Folder01Icon}
              className="size-3.5"
            />
            <span>{t("playlists.batch.move_to")}</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5 h-8 text-xs font-medium"
            onClick={() => setIsDeleteOpen(true)}
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              className="size-3.5"
            />
            <span>{t("common.delete")}</span>
          </Button>
        </div>
      </div>

      <BatchMoveDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        currentPlaylistName={currentPlaylistName}
        count={selectedCount}
        onConfirm={handleBatchMove}
        isProcessing={isProcessing}
      />

      <BatchDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        count={selectedCount}
        onConfirm={handleBatchDelete}
        isProcessing={isProcessing}
      />
    </>,
    document.body
  )
}
