import { useState, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { openFolder } from '@/shared/helpers/open-folder'
import { useImportSongs } from '@/features/playlist-songs/hooks'

export interface UsePlaylistActionsProps {
  playlistName?: string
}

export function usePlaylistActions({
  playlistName: playlistNameProp,
}: UsePlaylistActionsProps = {}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const params = useParams({ strict: false }) as { playlistName?: string }
  const playlistName = playlistNameProp ?? params.playlistName ?? ''

  const { data: playlists = [] } = useQuery(playlistsQueryOpts())
  const playlist = playlists.find((p) => p.name === playlistName)

  const { importSongs, isImporting } = useImportSongs({
    playlistName,
  })

  const handleOpenFolder = useCallback(async () => {
    if (!playlist?.path) {
      toast.error('Playlist folder not found')
      return
    }

    try {
      await openFolder(playlist.path)
      toast.info(`Opened folder for "${playlist.name}"`)
    } catch {
      toast.error('Error opening playlist folder')
    }
  }, [playlist?.path, playlist?.name])

  const handleImportSongs = useCallback(async () => {
    if (!playlistName) return
    await importSongs()
  }, [playlistName, importSongs])

  return {
    playlist,
    playlistName,
    isImporting,
    isDeleteOpen,
    setIsDeleteOpen,
    handleOpenFolder,
    handleImportSongs,
  }
}
