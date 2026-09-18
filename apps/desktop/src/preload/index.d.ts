import { ElectronAPI } from "@electron-toolkit/preload";
import type { GetPlaylistSongs, GetPlaylists } from "../main/models";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getPlaylists: GetPlaylists;
      getPlaylistSongs: GetPlaylistSongs;
    };
  }
}
