import { platformService } from '@/infrastructure/platform'

type VolumeSubscriber = (volume: number) => void

const subscribers = new Set<VolumeSubscriber>()

export const DEFAULT_PLAYER_VOLUME = 40

export function registerVolumeSubscriber(subscriber: VolumeSubscriber): () => void {
  subscribers.add(subscriber)
  return () => {
    subscribers.delete(subscriber)
  }
}

export function syncPlayerVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(volume)))

  // 1. Notify all registered stores (e.g. local player, streaming player, active player)
  for (const subscriber of subscribers) {
    subscriber(clamped)
  }

  // 2. Synchronize both backend Rodio sinks so audio levels never jump between players
  const volFraction = clamped / 100
  platformService
    .invoke('local_audio_set_volume', { volume: volFraction })
    .catch(() => {})
  platformService
    .invoke('streaming_audio_set_volume', { volume: volFraction })
    .catch(() => {})
}
