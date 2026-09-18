import type { PlaylistSong } from "@ongaku/types";
import { MUSIC_EXTENSIONS } from "@ongaku/constants/extensions";
import { readdir } from "node:fs/promises";
import { PLAYLIST_DIR } from "@ongaku/constants";
import { extname, join } from "node:path";
import { extractSongId, extractSongName } from "../helpers/song-utils";
import { parseFile } from "music-metadata";

export async function getPlaylistSongs(
  playlist: string,
): Promise<PlaylistSong[]> {
  const playlistPath = join(PLAYLIST_DIR, playlist);
  const readSongs = await readdir(playlistPath, { withFileTypes: true });

  const songs = await Promise.all(
    readSongs
      .filter((dirent) => !dirent.isDirectory())
      .filter((dirent) => {
        const extension = extname(dirent.name);
        return MUSIC_EXTENSIONS.includes(extension.toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (dirent) => {
        const songPath = join(playlistPath, dirent.name);

        const metadata = await parseFile(songPath, {
          duration: true,
          skipCovers: true,
          skipPostHeaders: true,
        });

        return {
          name: extractSongName(dirent.name),
          id: extractSongId(dirent.name) || dirent.name,
          path: songPath,
          playlist,
          duration: metadata.format.duration || 0,
          extension: extname(dirent.name),
        };
      }),
  );

  return songs;
}
