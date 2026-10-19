import { createFileRoute } from '@tanstack/react-router'
import { useActivePlayerStore } from '@/features/player/stores'
import {
  SongLocalView,
  SongStreamingView,
  SongEmpty,
} from '@/features/song/components'
import { Show } from '@/components/utility/show'

export const Route = createFileRoute('/song/')({
  component: SongRouteComponent,
})

function SongRouteComponent() {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)

  return (
    <Show
      when={activePlayer === 'streaming'}
      fallback={
        <Show
          when={activePlayer === 'local'}
          fallback={<SongEmpty />}
        >
          <SongLocalView />
        </Show>
      }
    >
      <SongStreamingView />
    </Show>
  )
}
