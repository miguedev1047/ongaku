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
              return (
                <SelectItem
                  key={playlist.name}
                  value={playlist.name}
                  disabled={isCurrent}
                >
                  {playlist.name} {isCurrent ? "(Current)" : ""}
                </SelectItem>
              )
            })}
          </SelectGroup>
        </SelectContent>
      </Select>

      {otherPlaylists.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No other playlists available. Create another playlist first to move
          songs.
        </p>
      )}
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
            Move {count} {count === 1 ? "song" : "songs"}
          </DialogTitle>
          <DialogDescription>
            Choose the target playlist to move {count === 1 ? "this song" : "these songs"} into.
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
            {isProcessing && <Spinner />}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
