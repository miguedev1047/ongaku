import { invoke as tauriInvoke } from "@tauri-apps/api/core"
import { listen as tauriListen } from "@tauri-apps/api/event"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { openUrl as tauriOpenUrl } from "@tauri-apps/plugin-opener"
import { relaunch as tauriRelaunch } from "@tauri-apps/plugin-process"
import { check as tauriCheckUpdate } from "@tauri-apps/plugin-updater"
import type {
  AppUpdate,
  CommandMap,
  EventMap,
  PlatformService,
  UpdateProgressEvent
} from "@/infrastructure/platform/platform.types"

class TauriAdapter implements PlatformService {
  async invoke<K extends keyof CommandMap>(
    command: K,
    args?: CommandMap[K]["args"]
  ): Promise<CommandMap[K]["return"]>
  async invoke<T = unknown>(
    command: string,
    args?: Record<string, unknown>
  ): Promise<T> {
    return tauriInvoke<T>(command, args)
  }

  async on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): Promise<() => void>
  async on<T = unknown>(
    event: string,
    handler: (payload: T) => void
  ): Promise<() => void> {
    const unlisten = await tauriListen<T>(event, (e) => {
      handler(e.payload)
    })
    return unlisten
  }

  async openUrl(url: string): Promise<void> {
    await tauriOpenUrl(url)
  }

  async showWindow(): Promise<void> {
    const win = getCurrentWebviewWindow()
    await win.show()
  }

  async focusWindow(): Promise<void> {
    const win = getCurrentWebviewWindow()
    await win.setFocus()
  }

  async checkForUpdates(): Promise<AppUpdate | null> {
    try {
      const update = await tauriCheckUpdate()
      if (!update) return null

      return {
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body,
        date: update.date,
        downloadAndInstall: async (
          onEvent?: (event: UpdateProgressEvent) => void
        ) => {
          await update.downloadAndInstall((event) => {
            if (event.event === "Started") {
              onEvent?.({
                event: "Started",
                data: {
                  contentLength: event.data?.contentLength
                }
              })
            } else if (event.event === "Progress") {
              onEvent?.({
                event: "Progress",
                data: {
                  chunkLength: event.data?.chunkLength
                }
              })
            } else if (event.event === "Finished") {
              onEvent?.({
                event: "Finished"
              })
            }
          })
        }
      }
    } catch (err) {
      console.error("[ONGAKU PLATFORM]: Failed to check updates:", err)
      return null
    }
  }

  async relaunch(): Promise<void> {
    await tauriRelaunch()
  }
}

export const tauriAdapter: PlatformService = new TauriAdapter()
