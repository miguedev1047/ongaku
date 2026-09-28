import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

/**
 * Calcula el total de horas decimales a partir de una lista de canciones (en segundos).
 */
export function getTotalHours(data: TPlaylistSong[]): number {
  const totalSeconds = data.reduce((acc, song) => {
    const duration = song.metadata?.duration ?? 0
    return acc + (duration > 0 ? duration : 0)
  }, 0)

  return Number((totalSeconds / 3600).toFixed(2))
}

export function formatPlaylistDuration(data: TPlaylistSong[]): string {
  const totalSeconds = data.reduce((acc, song) => {
    const duration = song.metadata?.duration ?? 0
    return acc + (duration > 0 ? duration : 0)
  }, 0)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
