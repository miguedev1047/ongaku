import { useState, Suspense } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Show } from "@/components/utility/show"

interface BatchMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlaylistName?: string
  count: number
  onConfirm: (targetPlaylist: string) => void
  isProcessing: boolean
}

function MovePlaylistSelect({
  currentPlaylist,
  value,
  onValueChange
}: {
  currentPlaylist?: string
  value: string
  onValueChange: (value: string | null) => void
}) {
  const { t } = useTranslation()
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())
  const otherPlaylists = playlists.filter((p) => p.name !== currentPlaylist)
  const hasNoOtherPlaylists = otherPlaylists.length === 0

  return (
    <div className="flex flex-col gap-2 py-2">
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("playlists.batch.select_target_placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t("playlists.header.title")}</SelectLabel>
            {playlists.map((playlist) => {
              const isCurrent = playlist.name === currentPlaylist
              const label = isCurrent
                ? t("playlists.batch.current_playlist_suffix", { name: playlist.name })
                : playlist.name
              return (
                <SelectItem
                  key={playlist.name}
                  value={playlist.name}
                  disabled={isCurrent}
                >
                  {label}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Show when={hasNoOtherPlaylists}>
        <p className="text-xs text-muted-foreground">
          {t("playlists.batch.no_other_playlists")}
        </p>
      </Show>
    </div>
  )
}

export function BatchMoveDialog({
  open,
  onOpenChange,
  currentPlaylistName,
  count,
  onConfirm,
  isProcessing
}: BatchMoveDialogProps) {
  const { t } = useTranslation()
  const [targetPlaylist, setTargetPlaylist] = useState<string>("")

  const handleSubmit = () => {
    if (!targetPlaylist || targetPlaylist === currentPlaylistName) return
    onConfirm(targetPlaylist)
  }

  const isValidTarget =
    Boolean(targetPlaylist) && targetPlaylist !== currentPlaylistName

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setTargetPlaylist("")
        onOpenChange(isOpen)
      }}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <Show
              when={count === 1}
              fallback={t("playlists.batch.move_dialog_title_plural", { count })}
            >
              {t("playlists.batch.move_dialog_title", { count })}
            </Show>
          </DialogTitle>
          <DialogDescription>
            <Show
              when={count === 1}
              fallback={t("playlists.batch.move_dialog_desc_plural")}
            >
              {t("playlists.batch.move_dialog_desc")}
            </Show>
          </DialogDescription>
        </DialogHeader>

        <Suspense fallback={<Skeleton className="h-7 w-full my-2" />}>
          <MovePlaylistSelect
            currentPlaylist={currentPlaylistName}
            value={targetPlaylist}
            onValueChange={(val) => setTargetPlaylist(val ?? "")}
          />
        </Suspense>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isProcessing}
              >
                {t("common.cancel")}
              </Button>
            }
          />
          <Button
            disabled={isProcessing || !isValidTarget}
            onClick={handleSubmit}
          >
            <Show when={isProcessing}>
              <Spinner />
            </Show>
            {t("playlists.dialogs.move_song.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
