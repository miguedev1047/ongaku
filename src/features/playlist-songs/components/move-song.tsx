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
import { useMoveSong } from "@/features/playlist-songs/hooks"
import { Show } from "@/components/utility/show"

interface MoveSongProps {
  song: TPlaylistSong
  open: boolean
  onOpenChange: (open: boolean) => void
}

import { useTranslation } from "react-i18next"

function MovePlaylistSelect({
  currentPlaylist,
  value,
  onValueChange
}: {
  currentPlaylist: string
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
          <SelectValue placeholder={t('playlists.dialogs.move_song.select_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('playlists.header.title')}</SelectLabel>
            {playlists.map((playlist) => {
              const isCurrent = playlist.name === currentPlaylist
              const label = isCurrent
                ? t('playlists.batch.current_playlist_suffix', { name: playlist.name })
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
          {t('playlists.dialogs.move_song.no_other_playlists')}
        </p>
      </Show>
    </div>
  )
}

export function MoveSong({ song, open, onOpenChange }: MoveSongProps) {
  const { t } = useTranslation()
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
          <DialogTitle>{t('playlists.dialogs.move_song.title', { name: song.name })}</DialogTitle>
          <DialogDescription>
            {t('playlists.dialogs.move_song.description')}
          </DialogDescription>
        </DialogHeader>

        <Suspense fallback={<Skeleton className="h-7 w-full my-2" />}>
          <MovePlaylistSelect
            currentPlaylist={song.playlist_name || ""}
            value={targetPlaylist}
            onValueChange={(val) => setTargetPlaylist(val ?? "")}
          />
        </Suspense>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">{t('common.cancel')}</Button>} />
          <Button
            disabled={isPending || !isValidTarget}
            onClick={handleSubmit}
          >
            <Show when={isPending}>
              <Spinner />
            </Show>
            {t('playlists.dialogs.move_song.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
