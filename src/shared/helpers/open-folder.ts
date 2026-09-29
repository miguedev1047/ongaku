import { invoke } from "@tauri-apps/api/core"

export async function openFolder(path: string): Promise<void> {
  await invoke("open_folder", { path })
}
