import { invoke as tauriInvoke } from '@tauri-apps/api/core'
import { listen as tauriListen } from '@tauri-apps/api/event'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { openUrl as tauriOpenUrl } from '@tauri-apps/plugin-opener'
import { relaunch as tauriRelaunch } from '@tauri-apps/plugin-process'
import { check as tauriCheckUpdate } from '@tauri-apps/plugin-updater'
import type {
  AppUpdate,
  CommandMap,
  EventMap,
  PlatformService,
} from '@/infrastructure/platform/platform.types'
import { getUpdateInfo } from '@/infrastructure/platform/helpers/update-info'

class TauriAdapter implements PlatformService {
  async invoke<K extends keyof CommandMap>(
    command: K,
    args?: CommandMap[K]['args'],
  ): Promise<CommandMap[K]['return']>
  async invoke<T = unknown>(
    command: string,
    args?: Record<string, unknown>,
  ): Promise<T> {
    return tauriInvoke<T>(command, args)
  }

  async on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): Promise<() => void>
  async on<T = unknown>(
    event: string,
    handler: (payload: T) => void,
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

      const updateInfo = getUpdateInfo(update)

      return updateInfo
    } catch (err) {
      console.error('[ONGAKU PLATFORM]: Failed to check updates:', err)
      return null
    }
  }

  async relaunch(): Promise<void> {
    await tauriRelaunch()
  }
}

export const tauriAdapter: PlatformService = new TauriAdapter()
