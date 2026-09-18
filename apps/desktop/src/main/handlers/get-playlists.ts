import type { Playlist } from "@ongaku/types";
import { readdir } from "node:fs/promises";
import { PLAYLIST_DIR } from "@ongaku/constants";
import { join } from "node:path";
import { getPlaylistSongs } from "./get-playlist-songs";

export async function getPlaylists(): Promise<Playlist[]> {
  const readPlaylists = await readdir(PLAYLIST_DIR, { withFileTypes: true });

  const playlists = await Promise.all(
    readPlaylists
      .filter((dirent) => dirent.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(async (dirent) => {
        const playliistName = dirent.name;
        const playlistSongs = await getPlaylistSongs(playliistName);
        const playlistTracksCount = playlistSongs.length;

        return {
          name: dirent.name,
          id: dirent.name,
          path: join(PLAYLIST_DIR, dirent.name),
          tracks: playlistTracksCount,
          is_folder: dirent.isDirectory(),
        };
      }),
  );

  return playlists;
}
