import type { GetPlaylists, GetPlaylistSongs } from "../models";
import { ipcMain } from "electron";
import { getPlaylists } from "./get-playlists";
import { getPlaylistSongs } from "./get-playlist-songs";

export function ipcHandler() {
  ipcMain.handle("getPlaylists", (_event, ...args: Parameters<GetPlaylists>) =>
    getPlaylists(...args),
  );

  ipcMain.handle(
    "getPlaylistSongs",
    (_event, ...args: Parameters<GetPlaylistSongs>) =>
      getPlaylistSongs(...args),
  );
}
