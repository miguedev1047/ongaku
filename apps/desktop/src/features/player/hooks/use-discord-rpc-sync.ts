import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useNetworkState } from '@/hooks/use-network-state'
import {
  useActivePlayerStore,
  useLocalPlayerStore,
  useStreamingPlayerStore,
} from '@/features/player/stores'
import { getDiscordActivityAssets } from '@/features/player/helpers/get-discord-activity-assets'

export function useDiscordRpcSync() {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const { isOnline } = useNetworkState()

  const isRpcEnabled = config?.discord_rpc === 'true'
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)

  // Local store selectors
  const localSong = useLocalPlayerStore((s) => s.currentSong)
  const localState = useLocalPlayerStore((s) => s.playerState)
  const isLocalSeeking = useLocalPlayerStore((s) => s.isSeeking)

  // Streaming store selectors
  const streamingTrack = useStreamingPlayerStore((s) => s.currentTrack)
  const streamingState = useStreamingPlayerStore((s) => s.playerState)
  const isStreamingSeeking = useStreamingPlayerStore((s) => s.isSeeking)

  const lastActivitySignatureRef = useRef<string | null>(null)
  const lastSeekingRef = useRef<boolean>(false)

  useEffect(() => {
    // If RPC is disabled or user is offline or no player is active
    if (!isRpcEnabled || !isOnline || !activePlayer) {
      if (lastActivitySignatureRef.current !== null) {
        lastActivitySignatureRef.current = null
        void platformService.invoke('clear_discord_activity')
      }
      return
    }

    const isLocal = activePlayer === 'local'
    const isPlaying = isLocal
      ? localState === 'playing'
      : streamingState === 'playing'

    if (!isPlaying) {
      if (lastActivitySignatureRef.current !== null) {
        lastActivitySignatureRef.current = null
        void platformService.invoke('clear_discord_activity')
      }
      return
    }

    const currentTrackId = isLocal ? localSong?.id : streamingTrack?.id
    if (!currentTrackId) {
      if (lastActivitySignatureRef.current !== null) {
        lastActivitySignatureRef.current = null
        void platformService.invoke('clear_discord_activity')
      }
      return
    }

    const isSeeking = isLocal ? isLocalSeeking : isStreamingSeeking
    const seekJustFinished = lastSeekingRef.current && !isSeeking
    lastSeekingRef.current = isSeeking

    // If currently seeking, defer update until seek completes
    if (isSeeking) {
      return
    }

    const signature = `${activePlayer}:${currentTrackId}:${isPlaying}`
    if (lastActivitySignatureRef.current === signature && !seekJustFinished) {
      return
    }

    const currentTime = isLocal
      ? useLocalPlayerStore.getState().progress
      : useStreamingPlayerStore.getState().progress

    const payload = getDiscordActivityAssets({
      type: activePlayer,
      song: localSong,
      streamingTrack,
      currentTime,
      isPlaying,
    })

    if (payload) {
      lastActivitySignatureRef.current = signature
      void platformService.invoke('set_discord_activity', { payload })
    }
  }, [
    isRpcEnabled,
    isOnline,
    activePlayer,
    localSong,
    localState,
    isLocalSeeking,
    streamingTrack,
    streamingState,
    isStreamingSeeking,
  ])
}
