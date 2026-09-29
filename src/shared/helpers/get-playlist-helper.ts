export function getPlaylistPath(songPath: string): string {
  const lastIndex = Math.max(
    songPath.lastIndexOf('/'),
    songPath.lastIndexOf('\\'),
  )

  if (lastIndex === -1) return songPath
  if (lastIndex === 0) return '/'

  return songPath.slice(0, lastIndex)
}
