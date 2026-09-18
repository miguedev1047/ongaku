import { SERVER_URL } from "@ongaku/constants/server";

export function getSongUrl(songPath: string): string {
  const url = `${SERVER_URL}/api/song-stream?path=${encodeURIComponent(songPath)}`;
  return url;
}

export function getSongCover(songPath: string, songId: string): string {
  const url = `${SERVER_URL}/api/song-cover?path=${encodeURIComponent(songPath)}&id=${encodeURIComponent(songId)}`;
  return url;
}
