export function getAdjacentSong<T extends { id: string }>(
  songs: T[],
  currentTrack: T | null,
  direction: 1 | -1
): T | undefined {
  if (!songs.length || !currentTrack) return undefined

  const currentIndex = songs.findIndex((item) => item.id === currentTrack.id)

  if (currentIndex === -1) return undefined

  const nextIndex = (currentIndex + direction + songs.length) % songs.length
  return songs[nextIndex]
}
