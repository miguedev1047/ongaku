import { memo, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DeleteIcon,
  FolderIcon,
  Music01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { Folder } from "@/components/ui/folder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CoverImage } from "@/components/cover-image";
import { DeletePlaylist } from "@/features/playlists/components/delete-playlist";
import { RenamePlaylist } from "@/features/playlists/components/rename-playlist";
import { Show } from "@/components/utility/show";
import { usePlaylistItem } from "@/features/playlists/hooks";
import type { TPlaylist } from "@/shared/types/playlist.types";

interface PlaylistItemProps {
  playlist: TPlaylist;
}

export const PlaylistItem = memo(
  function PlaylistItem({ playlist }: PlaylistItemProps) {
    const {
      isRenameOpen,
      setIsRenameOpen,
      isDeleteOpen,
      setIsDeleteOpen,
      handlePreload,
      handleNavigate,
      handleOpenFolder,
      previewCovers,
    } = usePlaylistItem({ playlist });

    const previewItems = useMemo(() => {
      return previewCovers.map((cover) => (
        <CoverImage
          key={cover.id}
          src={cover.src}
          alt={cover.name}
          className="size-full object-cover rounded-[10px]"
        />
      ));
    }, [previewCovers]);

    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger
            className="w-full outline-none focus:outline-none focus-visible:outline-none"
            render={
              <div
                className="group relative flex flex-col items-center justify-between p-4 rounded-xl border border-border/40 bg-card/60 hover:bg-accent/40 hover:border-border transition-colors duration-200 select-none cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0"
                onMouseEnter={handlePreload}
                onFocus={handlePreload}
                onDoubleClick={handleNavigate}
              >
                <div
                  className="w-full flex items-center justify-center pt-4 pb-2"
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <Folder items={previewItems} color="#507dbc" />
                </div>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div className="flex flex-col items-center text-center mt-3 max-w-full px-1">
                        <Link
                          to="/playlists/$playlistName"
                          params={{ playlistName: playlist.name }}
                          preload="intent"
                          className="font-medium text-sm text-foreground hover:underline truncate max-w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {playlist.name}
                        </Link>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {playlist.tracks}{" "}
                          {playlist.tracks === 1 ? "track" : "tracks"}
                        </span>
                      </div>
                    }
                  />
                  <TooltipContent side="bottom">
                    <p className="font-medium">{playlist.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
          />

          <ContextMenuContent>
            <ContextMenuGroup>
              <ContextMenuItem onClick={handleNavigate}>
                <HugeiconsIcon icon={Music01Icon} />
                <span>Open</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={handleOpenFolder}>
                <HugeiconsIcon icon={FolderIcon} />
                <span>Open in Explorer</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setIsRenameOpen(true)}>
                <HugeiconsIcon icon={PencilEdit01Icon} />
                <span>Rename</span>
              </ContextMenuItem>
              <ContextMenuItem
                variant="destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <HugeiconsIcon icon={DeleteIcon} />
                <span>Delete</span>
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>

        <Show when={isRenameOpen}>
          <RenamePlaylist
            playlist={playlist}
            open={isRenameOpen}
            onOpenChange={setIsRenameOpen}
          />
        </Show>
        <Show when={isDeleteOpen}>
          <DeletePlaylist
            playlist={playlist}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </Show>
      </>
    );
  },
  (prev, next) =>
    prev.playlist.id === next.playlist.id &&
    prev.playlist.name === next.playlist.name &&
    prev.playlist.tracks === next.playlist.tracks &&
    prev.playlist.previewTracks === next.playlist.previewTracks,
);
