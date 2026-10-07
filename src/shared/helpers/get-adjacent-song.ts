export function getAdjacentSong<T extends { id: string }>(
  songs: readonly T[],
  currentTrack: T | null,
  direction: 1 | -1
): T | undefined {
  if (!songs.length || !currentTrack) return undefined

  const currentIndex = songs.findIndex((item) => item.id === currentTrack.id)

  if (currentIndex === -1) {
    return direction === 1 ? songs[0] : songs[songs.length - 1]
  }

  const nextIndex = (currentIndex + direction + songs.length) % songs.length
  return songs[nextIndex]
}
