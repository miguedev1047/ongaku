export interface UpdateProgressEvent {
  event: 'Started' | 'Progress' | 'Finished'
  data?: {
    contentLength?: number
    chunkLength?: number
  }
}

export interface AppUpdate {
  version: string
  currentVersion: string
  body?: string
  date?: string
  downloadAndInstall: (
    onEvent?: (event: UpdateProgressEvent) => void
  ) => Promise<void>
}
