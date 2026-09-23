export function getRandomSong<T extends { id: string }>(
  songs: T[],
  currentTrack: T | null
): T | undefined {
  if (!songs.length) return undefined
  if (songs.length === 1) return songs[0]

  const pool = currentTrack
    ? songs.filter((item) => item.id !== currentTrack.id)
    : songs

  const randomIndex = Math.floor(Math.random() * pool.length)
  return pool[randomIndex]
}
