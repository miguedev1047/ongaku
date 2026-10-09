import type { TPlaylist } from '@/shared/types/playlist.types'
import type {
  TPlaylistSong,
  TLibrarySong,
} from '@/shared/types/playlist-songs.types'
import type {
  TSongAction,
  BatchDeleteSongItem,
  BatchActionResponse,
} from '@/shared/types/song-actions'
import type { TPlaylistAction } from '@/shared/types/playlist-actions'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import type { TAppConfig } from '@/shared/queries/config'
import type { TBackgroundItem } from '@/shared/queries/backgrounds'
import type { TSystemHealthInfo } from '@/shared/queries/system-health'
import type { TBinariesInfo } from '@/shared/types/binaries.types'
import type { TSyncStats } from '@/shared/types/sync.types'
import type {
  ImportSongsResult,
  ImportProgressPayload,
} from '@/shared/types/import.types'
import type {
  AppUpdate,
  UpdateProgressEvent,
} from '@/shared/types/update.types'
import type { DownloadProgressPayload } from '@/shared/types/download.types'

export type {
  AppUpdate,
  UpdateProgressEvent,
  TSyncStats,
  ImportSongsResult,
  ImportProgressPayload,
  DownloadProgressPayload,
  TBinariesInfo,
}

export interface CommandMap {
  get_playlists: {
    args?: undefined
    return: TPlaylist[]
  }
  get_playlist_songs: {
    args: { playlistName: string }
    return: TPlaylistSong[]
  }
  library: {
    args?: undefined
    return: TLibrarySong[]
  }
  sync_library: {
    args?: undefined
    return: TSyncStats
  }
  new_playlist: {
    args: { name: string }
    return: TPlaylistAction
  }
  rename_playlist: {
    args: { oldName: string; newName: string }
    return: TPlaylistAction
  }
  delete_playlist: {
    args: { name: string }
    return: TPlaylistAction
  }
  delete_song: {
    args: { path?: string; id?: string }
    return: TSongAction
  }
  delete_song_from_library: {
    args: { songId: string }
    return: TSongAction
  }
  remove_song_from_playlist: {
    args: { playlistName?: string; songId: string }
    return: TSongAction
  }
  move_song: {
    args: {
      path?: string
      id?: string
      sourcePlaylist?: string
      targetPlaylist: string
    }
    return: TSongAction
  }
  batch_delete_songs: {
    args: {
      items: BatchDeleteSongItem[]
      playlistName?: string
    }
    return: BatchActionResponse
  }
  batch_move_songs: {
    args: {
      paths: string[]
      sourcePlaylist?: string
      targetPlaylist: string
    }
    return: BatchActionResponse
  }
  download_song: {
    args: { id: string; url: string; playlistName: string }
    return: TPlaylistSong
  }
  cancel_download: {
    args: { id: string }
    return: void
  }
  resolve_url_info: {
    args: { url: string }
    return: TYoutubeSearchResult
  }
  resolve_playlist_info: {
    args: { url: string }
    return: TYoutubeSearchResult[]
  }
  download_binaries: {
    args?: undefined
    return: boolean
  }
  check_binaries: {
    args?: undefined
    return: boolean
  }
  get_binaries_info: {
    args?: undefined
    return: TBinariesInfo
  }
  get_system_health: {
    args?: undefined
    return: TSystemHealthInfo
  }
  search_youtube: {
    args: { searchName: string; maxResults?: number }
    return: TYoutubeSearchResult[]
  }
  get_youtube_stream_url: {
    args: { videoId: string }
    return: string
  }
  open_folder: {
    args: { path: string }
    return: void
  }
  get_app_config: {
    args?: undefined
    return: TAppConfig
  }
  set_app_config: {
    args: { key: string; value: string }
    return: void
  }
  select_directory: {
    args?: { defaultPath?: string | null }
    return: string | null
  }
  change_app_dir: {
    args: { newParentDir: string }
    return: TAppConfig
  }
  get_backgrounds: {
    args?: undefined
    return: TBackgroundItem[]
  }
  import_background_from_file: {
    args?: undefined
    return: TBackgroundItem | null
  }
  import_background_from_url: {
    args: { url: string }
    return: TBackgroundItem
  }
  delete_background: {
    args: { id: string }
    return: void
  }
  open_backgrounds_folder: {
    args?: undefined
    return: void
  }
  import_songs_to_playlist: {
    args: { playlistName: string }
    return: ImportSongsResult
  }
  import_songs_by_paths: {
    args: { playlistName: string; paths: string[] }
    return: ImportSongsResult
  }
  local_audio_play: {
    args: { path: string; volume?: number; startPosSecs?: number }
    return: void
  }
  local_audio_pause: {
    args?: undefined
    return: void
  }
  local_audio_resume: {
    args?: undefined
    return: void
  }
  local_audio_stop: {
    args?: undefined
    return: void
  }
  local_audio_seek: {
    args: { positionSecs: number }
    return: void
  }
  local_audio_set_volume: {
    args: { volume: number }
    return: void
  }
  local_audio_get_status: {
    args?: undefined
    return: AudioPlayerStatus
  }
  streaming_audio_play: {
    args: { videoId: string; volume?: number; startPosSecs?: number }
    return: void
  }
  streaming_audio_pause: {
    args?: undefined
    return: void
  }
  streaming_audio_resume: {
    args?: undefined
    return: void
  }
  streaming_audio_stop: {
    args?: undefined
    return: void
  }
  streaming_audio_seek: {
    args: { positionSecs: number }
    return: void
  }
  streaming_audio_set_volume: {
    args: { volume: number }
    return: void
  }
  streaming_audio_get_status: {
    args?: undefined
    return: AudioPlayerStatus
  }
}

export interface AudioPlayerStatus {
  is_playing: boolean
  is_paused: boolean
  current_path: string | null
  volume: number
  position_secs: number
}

export interface AudioPlayerError {
  code: 'NotFound' | 'PermissionDenied' | 'DecodeError' | 'DeviceError' | 'Internal'
  message?: string
}

export interface EventMap {
  'download:progress': DownloadProgressPayload
  'import-progress': ImportProgressPayload
  'local-player://time-update': { currentTime: number }
  'local-player://ended': void
  'streaming-player://time-update': { currentTime: number }
  'streaming-player://ended': void
}

export interface PlatformService {
  invoke<K extends keyof CommandMap>(
    command: K,
    args?: CommandMap[K]['args'],
  ): Promise<CommandMap[K]['return']>
  invoke<T = unknown>(
    command: string,
    args?: Record<string, unknown>,
  ): Promise<T>

  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): Promise<() => void>
  on<T = unknown>(
    event: string,
    handler: (payload: T) => void,
  ): Promise<() => void>

  openUrl(url: string): Promise<void>
  showWindow(): Promise<void>
  focusWindow(): Promise<void>

  checkForUpdates(): Promise<AppUpdate | null>
  relaunch(): Promise<void>

  readClipboard(): Promise<string>
  writeClipboard(text: string): Promise<void>
}
