export function getPlaylistPath(songPath: string): string {
  const segments = songPath.split(/[/\\]/)

  segments.pop()

  return segments.join("\\")
}
