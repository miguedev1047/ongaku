import type { PlatformService } from '@/infrastructure/platform/platform.types'

export const defaultMockHealth = {
  serverHealthy: true,
  serverPort: 4200,
  serverHost: 'localhost',
  appVersion: '0.1.40',
  binariesInstalled: true,
  ytdlpInstalled: true,
  ffmpegInstalled: true,
  binDir: '/mock/bin',
  musicDir: '/mock/music',
  dbPath: '/mock/db.sqlite',
  dbExists: true,
  directories: [],
  packageType: 'exe' as const,
}

export const defaultMockConfig = {
  folder_colors: '',
  app_dir: '/mock',
  player_position: 'bottom' as const,
  toggle_sidebar: '',
  lang: 'en',
  discord_rpc: 'off',
}

export const defaultMockWallpaper = {
  theme: 'dark' as const,
  theme_family: 'default',
  selected_background: '',
  blur: 'none' as const,
}

export const defaultMockPlaylists = [
  {
    id: 'playlist-1',
    name: 'Favorites',
    song_count: 2,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'playlist-2',
    name: 'Chill Vibes',
    song_count: 5,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
]

export const defaultMockSongs = [
  {
    id: 'song-1',
    name: 'Mock Song 1',
    path: '/music/song1.mp3',
    created: 1700000000,
    metadata: {
      artist: 'Mock Artist',
      duration: 210,
    },
  },
  {
    id: 'song-2',
    name: 'Mock Song 2',
    path: '/music/song2.mp3',
    created: 1700000000,
    metadata: {
      artist: 'Mock Artist',
      duration: 180,
    },
  },
]

export function createMockPlatformService(
  overrides?: Partial<Record<string, unknown>>,
): PlatformService {
  return {
    invoke: (async (command: string) => {
      if (overrides && command in overrides) {
        return overrides[command] as never
      }
      switch (command) {
        case 'get_system_health':
          return defaultMockHealth as never
        case 'get_app_config':
          return defaultMockConfig as never
        case 'get_wallpaper':
          return defaultMockWallpaper as never
        case 'get_playlists':
          return defaultMockPlaylists as never
        case 'library':
          return defaultMockSongs as never
        case 'get_playlist_songs':
          return defaultMockSongs as never
        case 'sync_library':
          return { added: 0, removed: 0, updated: 0 } as never
        case 'resolve_url_info':
        case 'resolve_playlist_info':
          return [] as never
        default:
          return null as never
      }
    }) as PlatformService['invoke'],
    on: async () => () => {},
    openUrl: async () => {},
    showWindow: async () => {},
    focusWindow: async () => {},
    checkForUpdates: async () => null,
    relaunch: async () => {},
    readClipboard: async () => '',
    writeClipboard: async () => {},
    createChannel: () =>
      ({
        id: 0,
        onmessage: () => {},
        send: async () => {},
      }) as never,
  }
}

export const mockPlatformService = createMockPlatformService()
