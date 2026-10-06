export interface DownloadProgressPayload {
  id: string
  progress: number
  downloaded_bytes: number
  total_bytes: number
  done: boolean
}
