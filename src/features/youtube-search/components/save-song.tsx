import { useState } from "react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderAddIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { cn } from "cn"

interface SaveSongProps {
  item: TYoutubeSearchResult
  className?: string
  size?: "default" | "sm" | "icon"
  showLabel?: boolean
}

export function SaveSong({
  item,
  className,
  size = "icon",
  showLabel = false
}: SaveSongProps) {
  const [value, setValue] = useState<string | null>(null)
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (playlistName: string) => {
      const toastId = toast.loading(
        `Downloading "${item.title}" to ${playlistName}...`
      )
      try {
        const song = await invoke<TPlaylistSong>("download_song", {
          url: item.url,
          playlistName
        })
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(playlistName).queryKey
        })
        queryClient.invalidateQueries({
          queryKey: playlistsQueryOpts().queryKey
        })
        toast.success(`Saved to ${playlistName}!`, { id: toastId })
        return song
      } catch (err) {
        toast.error(`Failed to download song: ${String(err)}`, { id: toastId })
        throw err
      }
    }
  })

  const isPending = mutation.isPending

  const handleSelectPlaylist = (name: string | null) => {
    if (!name) return
    mutation.mutate(name)
    setValue(null)
  }

  return (
    <Tooltip>
      <Select
        value={value}
        onValueChange={handleSelectPlaylist}
        disabled={isPending}
      >
        <TooltipTrigger
          render={
            <SelectTrigger
              size={size}
              onClick={(e) => e.stopPropagation()}
              disabled={isPending}
              aria-label="Save to playlist"
              className={cn(
                size === "icon" &&
                  "border-transparent bg-transparent hover:bg-muted dark:bg-transparent dark:hover:bg-muted/50 cursor-pointer shadow-none",
                className
              )}
            >
              {isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-3.5"
                />
              )}
              {showLabel && <span>Save to playlist</span>}
            </SelectTrigger>
          }
        />
        <SelectContent
          align="end"
          alignItemWithTrigger={false}
          className="w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectGroup>
            <SelectLabel>Save to Playlist</SelectLabel>
            <SelectSeparator />
            {playlists.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground text-center">
                No playlists found
              </div>
            ) : (
              playlists.map((playlist) => (
                <SelectItem
                  key={playlist.id}
                  value={playlist.name}
                  className="cursor-pointer"
                >
                  <HugeiconsIcon
                    icon={FolderAddIcon}
                    className="size-3.5 text-muted-foreground"
                  />
                  <span className="truncate">{playlist.name}</span>
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <TooltipContent>Save to playlist</TooltipContent>
    </Tooltip>
  )
}
