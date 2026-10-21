import type { Update } from '@tauri-apps/plugin-updater'
import type { UpdateProgressEvent } from '@/infrastructure/platform/platform.types'

export function getUpdateInfo(update: Update) {
  return {
    version: update.version,
    currentVersion: update.currentVersion,
    body: update.body,
    date: update.date,
    downloadAndInstall: async (
      onEvent?: (event: UpdateProgressEvent) => void,
    ) => {
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          onEvent?.({
            event: 'Started',
            data: {
              contentLength: event.data?.contentLength,
            },
          })
        } else if (event.event === 'Progress') {
          onEvent?.({
            event: 'Progress',
            data: {
              chunkLength: event.data?.chunkLength,
            },
          })
        } else if (event.event === 'Finished') {
          onEvent?.({
            event: 'Finished',
          })
        }
      })
    },
  }
}
