import { useStreamingPlayerStore } from '@/features/player/stores'
import { SongCoverCanvas } from './song-cover-canvas'
import { SongHeader } from './header'
import { SongEmpty } from './song-empty'
import { Show } from '@/components/utility/show'

export function SongStreamingView() {
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)
  const playerState = useStreamingPlayerStore((s) => s.playerState)
  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)

  return (
    <Show
      when={currentTrack}
      fallback={
        <div className='size-full flex flex-col overflow-hidden'>
          <SongHeader />
          <SongEmpty />
        </div>
      }
    >
      {(track) => (
        <div className='size-full flex flex-col overflow-hidden'>
          <SongHeader streamingTitle={track.title} />
          <SongCoverCanvas
            coverUrl={track.thumbnail}
            title={track.title}
            songId={track.id}
            isPlaying={playerState === 'playing'}
            onPlayToggle={togglePlay}
          />
        </div>
      )}
    </Show>
  )
}
