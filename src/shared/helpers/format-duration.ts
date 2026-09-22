/**
 * Formats a duration in seconds into a YouTube Music style time string.
 *
 * - Less than an hour: "m:ss" (e.g., 0 -> "0:00", 65 -> "1:05", 725 -> "12:05")
 * - 1 hour or more: "h:mm:ss" (e.g., 3665 -> "1:01:05")
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00"
  }

  const totalSeconds = Math.floor(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const paddedSeconds = secs.toString().padStart(2, "0")

  if (hours > 0) {
    const paddedMinutes = minutes.toString().padStart(2, "0")
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}
