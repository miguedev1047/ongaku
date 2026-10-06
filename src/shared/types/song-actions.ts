export type TSongAction = {
  code: "SUCCESS" | "ERROR" | "SAME_FILE" | "ALREADY_EXISTS" | "LOCKED"
  message: string
}

export interface BatchDeleteSongItem {
  path: string
  id?: string
}

export interface BatchActionResponse {
  success_count: number
  failed_count: number
  failed_items: string[]
}
