import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import {
  MoreHorizontalIcon,
  Music01Icon,
  PauseIcon,
  PlayIcon,
  YoutubeIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { openUrl } from "@tauri-apps/plugin-opener"
import { PlaylistMenuGroup } from "./playlist-menu-group"
import { useDownloadSong, useYoutubePlayback } from "../hooks"

interface YoutubeSongActionsProps {
  item: TYoutubeSearchResult
  className?: string
  size?: "default" | "sm" | "icon"
  variant?: "outline" | "ghost" | "default"
  showLabel?: boolean
}

export function YoutubeSongActions({
  item,
  className,
  size = "icon",
  variant = "outline",
  showLabel = false
}: YoutubeSongActionsProps) {
  const { isPlaying, isLoading, togglePlayback } = useYoutubePlayback(item)
  const { mutate: downloadSong, isPending: isDownloading } = useDownloadSong()

  const handleOpenYoutube = async () => {
    try {
      await openUrl(item.url)
    } catch (error) {
      console.error("Error al abrir navegador:", error)
    }
  }

  const handleSelectPlaylist = (playlistName: string) => {
    downloadSong({ item, playlistName })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={size}
            variant={variant}
            onClick={(e) => e.stopPropagation()}
            aria-label="Song actions"
            className={className}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} />
            {showLabel && <span>Actions</span>}
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={togglePlayback}
            className="cursor-pointer"
            disabled={isLoading}
          >
            <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} />
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleOpenYoutube}
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={YoutubeIcon} />
            <span>Open on YouTube</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <HugeiconsIcon icon={Music01Icon} />
              <span>Download on</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <Suspense
                fallback={
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Playlists</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-3 flex items-center justify-center">
                      <Spinner className="size-4" />
                    </div>
                  </DropdownMenuGroup>
                }
              >
                <PlaylistMenuGroup
                  onSelectPlaylist={handleSelectPlaylist}
                  disabled={isDownloading}
                />
              </Suspense>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
