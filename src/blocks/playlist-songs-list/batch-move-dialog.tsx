import { useState, Suspense } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
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
          <SelectValue placeholder="Select target playlist" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Playlists</SelectLabel>
            {playlists.map((playlist) => {
              const isCurrent = playlist.name === currentPlaylist
              const label = isCurrent ? `${playlist.name} (Current)` : playlist.name
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
          No other playlists available. Create another playlist first to move
          songs.
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
  const [targetPlaylist, setTargetPlaylist] = useState<string>("")

  const handleSubmit = () => {
    if (!targetPlaylist || targetPlaylist === currentPlaylistName) return
    onConfirm(targetPlaylist)
  }

  const isValidTarget =
    Boolean(targetPlaylist) && targetPlaylist !== currentPlaylistName

  const songLabel = count === 1 ? "song" : "songs"
  const thisSongLabel = count === 1 ? "this song" : "these songs"

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
            Move {count} {songLabel}
          </DialogTitle>
          <DialogDescription>
            Choose the target playlist to move {thisSongLabel} into.
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
                Cancel
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
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
