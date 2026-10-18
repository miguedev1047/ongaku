import type { TPlaylistSong } from '@/features/playlist-songs/types'
import type { TYoutubeSearchResult } from '@/features/youtube-search/types'
import type { TDiscordActivityPayload } from '@/infrastructure/platform/platform.types'

export const DISCORD_DEFAULT_ASSET_KEY = 'app_logo'

export interface GetDiscordActivityParams {
  type: 'local' | 'streaming'
  song?: TPlaylistSong | null
  streamingTrack?: TYoutubeSearchResult | null
  currentTime?: number
  isPlaying?: boolean
}

export function getDiscordActivityAssets({
  type,
  song,
  streamingTrack,
  currentTime = 0,
  isPlaying = true,
}: GetDiscordActivityParams): TDiscordActivityPayload | null {
  if (!isPlaying) {
    return null
  }

  const nowSecs = Math.floor(Date.now() / 1000)
  const currentPosSecs = Math.max(0, Math.floor(currentTime))

  if (type === 'streaming' && streamingTrack) {
    const title = streamingTrack.title?.trim() || 'Unknown Track'
    const subtitle = streamingTrack.channel?.trim() || 'YouTube Streaming'
    const duration = streamingTrack.duration
      ? Math.floor(streamingTrack.duration)
      : null

    const imageUrl = streamingTrack.thumbnail?.trim() || null
    const startTimestamp = nowSecs - currentPosSecs
    const endTimestamp =
      duration && duration > currentPosSecs ? startTimestamp + duration : null

    return {
      title,
      subtitle,
      album: null,
      song_path: streamingTrack.id || null,
      image_url: imageUrl,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
    }
  }

  if (type === 'local' && song) {
    const title = song.name?.trim() || song.metadata?.album || 'Local Track'
    const artist = song.metadata?.artist?.trim()
    const album = song.metadata?.album?.trim() || null
    const subtitle = artist || album || 'Local Audio'
    const duration = song.metadata?.duration
      ? Math.floor(song.metadata.duration)
      : null

    const startTimestamp = nowSecs - currentPosSecs
    const endTimestamp =
      duration && duration > currentPosSecs ? startTimestamp + duration : null

    return {
      title,
      subtitle,
      album,
      song_path: song.path,
      image_url: null,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
    }
  }

  return null
}
