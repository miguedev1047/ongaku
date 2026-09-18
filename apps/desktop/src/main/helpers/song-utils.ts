// Ancla el ID al final del string, justo antes de la extensión
const SONG_ID_REGEX = /\[([a-zA-Z0-9_-]+)\]\s*(?:\.[^./\\]+)?$/;

export function extractSongId(fileName: string): string | null {
  const match = fileName.match(SONG_ID_REGEX);
  return match ? match[1] : null;
}

export function extractSongName(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^./\\]+$/, "");
  const withoutId = withoutExt.replace(/\s*\[[a-zA-Z0-9_-]+\]\s*$/, "");
  return withoutId.trim();
}
