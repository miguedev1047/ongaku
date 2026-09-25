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
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { useMoveSong } from "../hooks"

interface MoveSongProps {
  song: TPlaylistSong
  open: boolean
  onOpenChange: (open: boolean) => void
}

function MovePlaylistSelect({
  currentPlaylist,
  value,
  onValueChange
}: {
  currentPlaylist: string
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
          this song.
        </p>
      )}
    </div>
  )
}

export function MoveSong({ song, open, onOpenChange }: MoveSongProps) {
  const [targetPlaylist, setTargetPlaylist] = useState<string>("")

  const { handleMoveSong, isPending } = useMoveSong({
    song,
    onSuccess: () => {
      onOpenChange(false)
      setTargetPlaylist("")
    }
  })

  const handleSubmit = () => {
    if (!targetPlaylist || targetPlaylist === song.playlist_name) return
    handleMoveSong(targetPlaylist)
  }

  const isValidTarget =
    Boolean(targetPlaylist) && targetPlaylist !== song.playlist_name

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTargetPlaylist("")
        }
        onOpenChange(isOpen)
      }}
    >
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Move song "{song.name}"</DialogTitle>
          <DialogDescription>
            Choose the target playlist to move this song into.
          </DialogDescription>
        </DialogHeader>

        <Suspense fallback={<Skeleton className="h-7 w-full my-2" />}>
          <MovePlaylistSelect
            currentPlaylist={song.playlist_name}
            value={targetPlaylist}
            onValueChange={(val) => setTargetPlaylist(val ?? "")}
          />
        </Suspense>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={isPending || !isValidTarget}
            onClick={handleSubmit}
          >
            {isPending && <Spinner />}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
