import { useLocalPlayerStore } from '@/features/player/stores'
import { useSongUtils } from '@/hooks/use-song-utils'
import { SongCoverCanvas } from './song-cover-canvas'
import { SongHeader } from './song-header'
import { SongEmpty } from './song-empty'
import { Show } from '@/components/utility/show'

export function SongLocalView() {
  const currentSong = useLocalPlayerStore((s) => s.currentSong)
  const playerState = useLocalPlayerStore((s) => s.playerState)
  const togglePlay = useLocalPlayerStore((s) => s.togglePlay)
  const { getCoverUrl } = useSongUtils()

  return (
    <Show
      when={currentSong}
      fallback={
        <div className='size-full flex flex-col overflow-hidden'>
          <SongHeader />
          <SongEmpty />
        </div>
      }
    >
      {(song) => (
        <div className='size-full flex flex-col overflow-hidden'>
          <SongHeader song={song} />
          <SongCoverCanvas
            coverUrl={getCoverUrl({ song })}
            title={song.name}
            isPlaying={playerState === 'playing'}
            onPlayToggle={togglePlay}
          />
        </div>
      )}
    </Show>
  )
}
