import { check, type Update } from "@tauri-apps/plugin-updater"

export async function checkForUpdates(): Promise<Update | null> {
  try {
    const update = await check()

    if (update) {
      console.log(`[ONGAKU]: Update available: v${update.version}`)
      return update
    }

    return null
  } catch (error) {
    console.error("[ONGAKU]: Error checking for updates:", error)
    return null
  }
}

export type { Update }
