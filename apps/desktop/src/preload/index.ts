import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";
import { GetPlaylists } from "../main/models";

const api = {
  getPlaylists: (...args: Parameters<GetPlaylists>) =>
    ipcRenderer.invoke("getPlaylists", ...args),
  getPlaylistSongs: (playlist: string) =>
    ipcRenderer.invoke("getPlaylistSongs", playlist),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
