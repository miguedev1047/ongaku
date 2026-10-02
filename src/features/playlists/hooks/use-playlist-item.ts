import { useCallback, useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useSongUtils } from "@/hooks/use-song-utils";
import type { TPlaylist } from "@/shared/types/playlist.types";

interface UsePlaylistItemProps {
  playlist: TPlaylist;
}

export function usePlaylistItem({ playlist }: UsePlaylistItemProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const { getCoverUrl } = useSongUtils();

  const handlePreload = useCallback(() => {
    router.preloadRoute({
      to: "/playlists/$playlistName",
      params: { playlistName: playlist.name },
    });
  }, [router, playlist.name]);

  const handleNavigate = useCallback(() => {
    navigate({
      to: "/playlists/$playlistName",
      params: { playlistName: playlist.name },
    });
  }, [navigate, playlist.name]);

  const previewCovers = useMemo(() => {
    return (playlist.previewTracks || []).slice(0, 3).map((song) => ({
      id: song.id,
      name: song.name,
      src: getCoverUrl({ song }),
    }));
  }, [playlist.previewTracks, getCoverUrl]);

  return {
    isRenameOpen,
    setIsRenameOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handlePreload,
    handleNavigate,
    previewCovers,
  };
}
