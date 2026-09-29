import { FolderIcon, PauseIcon, PlayIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/cover-image";
import { Show } from "@/components/utility/show";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlaylistHero } from "@/features/playlist-songs/hooks/use-playlist-hero";

export function PlaylistSongHero() {
  const {
    playlistName,
    songs,
    isLoading,
    isError,
    coverUrl,
    coverAlt,
    tracksCount,
    trackLabel,
    durationText,
    bgCardColor,
    isPlaylistPlaying,
    playTooltipText,
    handleOpenFolder,
    handlePlayPlaylist,
  } = usePlaylistHero();

  if (!songs) return null;
  if (isLoading || isError) return null;

  return (
    <div className={cn("flex shrink-0 items-center gap-2 px-6 pt-6")}>
      <div
        className={cn(
          "flex items-end justify-between gap-6 w-full bg-card p-5 rounded-lg border border-border/40 transition-all ease-in-out duration-300 relative",
        )}
        style={{ backgroundColor: bgCardColor }}
      >
        <div className={cn("flex items-end gap-5 min-w-0")}>
          <figure
            className={cn(
              "size-40 shrink-0 overflow-hidden rounded-lg shadow-md border border-border/20",
            )}
          >
            <CoverImage
              src={coverUrl}
              alt={coverAlt}
              className={cn("size-full object-cover")}
            />
          </figure>

          <div className={cn("space-y-2 min-w-0")}>
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
              )}
            >
              Playlist
            </span>
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight truncate",
              )}
            >
              {playlistName}
            </h1>
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-muted-foreground",
              )}
            >
              <p>
                {tracksCount} {trackLabel}
              </p>
              <p>•</p>
              <p>{durationText}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "ml-auto flex flex-col justify-between items-end self-stretch shrink-0 py-0.5",
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenFolder}
                  className={cn(
                    "gap-1.5 text-xs bg-background/60 hover:bg-background/90 backdrop-blur-xs cursor-pointer",
                  )}
                >
                  <HugeiconsIcon icon={FolderIcon} className={cn("size-3.5")} />
                  <span>Open folder</span>
                </Button>
              }
            />
            <TooltipContent side="top">
              <p>Open playlist folder in file explorer</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-lg"
                  variant="default"
                  onClick={handlePlayPlaylist}
                  disabled={tracksCount === 0}
                  aria-label={
                    isPlaylistPlaying ? "Pause playlist" : "Play playlist"
                  }
                  className={cn(
                    "size-12 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer",
                    isPlaylistPlaying && "bg-primary text-primary-foreground",
                  )}
                >
                  <Show
                    when={isPlaylistPlaying}
                    fallback={
                      <HugeiconsIcon
                        icon={PlayIcon}
                        className={cn("size-6 ml-0.5 fill-current")}
                      />
                    }
                  >
                    <HugeiconsIcon
                      icon={PauseIcon}
                      className={cn("size-6 fill-current")}
                    />
                  </Show>
                </Button>
              }
            />
            <TooltipContent side="top">
              <p>{playTooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
