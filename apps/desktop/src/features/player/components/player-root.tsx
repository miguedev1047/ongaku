import { useActivePlayerStore } from '@/features/player/stores'
import { LocalPlayer } from '@/features/player/components/local-player'
import { StreamingPlayer } from '@/features/player/components/streaming-player'
import { useMediaSession } from '@/hooks/use-media-session'
import { usePlayerSync } from '@/features/player/hooks/use-player-sync'
import { useDiscordRpcSync } from '@/features/player/hooks/use-discord-rpc-sync'
import { Show } from '@ongaku/ui'

interface PlayerRootProps {
  position?: 'bottom' | 'top'
}

export function PlayerRoot({ position = 'bottom' }: PlayerRootProps) {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  useMediaSession()
  usePlayerSync()
  useDiscordRpcSync()

  return (
    <>
      <Show when={activePlayer === 'streaming'}>
        <StreamingPlayer position={position} />
      </Show>
      <Show when={activePlayer === 'local'}>
        <LocalPlayer position={position} />
      </Show>
    </>
  )
}
