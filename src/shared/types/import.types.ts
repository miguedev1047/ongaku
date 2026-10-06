export interface ImportSongsResult {
  imported_count: number
  skipped_count: number
  failed_items: string[]
}

export interface ImportProgressPayload {
  playlist_name: string
  current: number
  total: number
  imported_count: number
  skipped_count: number
}
