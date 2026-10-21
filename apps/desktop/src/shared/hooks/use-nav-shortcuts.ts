import { useYoutubeSearchStore } from '@/features/youtube-search/stores/use-youtube-search'
import { isInputTarget } from '@/shared/helpers/is-input-target'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'

export function useNavShortcuts() {
  const navigate = useNavigate()

  useHotkey('Mod+H', (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    navigate({ to: '/playlists' })
  })

  useHotkey('Mod+L', (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    navigate({ to: '/library' })
  })

  useHotkey('Mod+S', (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    navigate({ to: '/settings' })
  })

  useHotkey('Mod+D', (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    navigate({ to: '/download-songs' })
  })

  useHotkey('Mod+Y', (e) => {
    if (isInputTarget(e.target)) return
    e.preventDefault()
    const lastQuery = useYoutubeSearchStore.getState().lastQuery
    navigate({ to: '/search-youtube', search: { q: lastQuery || '' } })
  })
}
