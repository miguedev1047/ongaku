import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useYoutubeSearchStore } from '@/shared/stores/actions'

export interface UseYoutubeSearchBarOptions {
  initialQuery?: string
}

export function useYoutubeSearchBar({
  initialQuery = '',
}: UseYoutubeSearchBarOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [queryInput, setQueryInput] = useState(initialQuery)
  const navigate = useNavigate()

  const history = useYoutubeSearchStore((state) => state.history)
  const addSearch = useYoutubeSearchStore((state) => state.addSearch)
  const removeSearch = useYoutubeSearchStore((state) => state.removeSearch)
  const clearHistory = useYoutubeSearchStore((state) => state.clearHistory)
  const setLastQuery = useYoutubeSearchStore((state) => state.setLastQuery)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (open) {
        setQueryInput(initialQuery)
      }
    },
    [initialQuery],
  )

  useHotkey('Control+K', () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        setQueryInput(initialQuery)
      }
      return next
    })
  })

  useEffect(() => {
    setQueryInput(initialQuery)
    if (initialQuery.trim()) {
      setLastQuery(initialQuery)
    }
  }, [initialQuery, setLastQuery])

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim()
      if (!trimmed) return

      addSearch(trimmed)
      setQueryInput(trimmed)
      setIsOpen(false)

      navigate({
        to: '/search-youtube',
        search: { q: trimmed },
      })
    },
    [addSearch, navigate],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        const trimmed = queryInput.trim()
        if (trimmed) {
          handleSearch(trimmed)
        }
      }
    },
    [handleSearch, queryInput],
  )

  const handleRemoveHistory = useCallback(
    (e: React.MouseEvent, item: string) => {
      e.preventDefault()
      e.stopPropagation()
      removeSearch(item)
    },
    [removeSearch],
  )

  const handleClearHistory = useCallback(() => {
    clearHistory()
  }, [clearHistory])

  const trimmedFilter = queryInput.trim().toLowerCase()
  const filteredHistory = history.filter((item) => {
    if (!trimmedFilter) return true
    return item.toLowerCase().includes(trimmedFilter)
  })

  const hasTypedQuery = Boolean(queryInput.trim())
  const hasHistory = filteredHistory.length > 0
  const hasAnyHistory = history.length > 0
  const hasDisplayQuery = Boolean(initialQuery.trim())

  return {
    isOpen,
    queryInput,
    filteredHistory,
    hasTypedQuery,
    hasHistory,
    hasAnyHistory,
    hasDisplayQuery,
    initialQuery,
    setQueryInput,
    handleOpenChange,
    handleSearch,
    handleKeyDown,
    handleRemoveHistory,
    handleClearHistory,
  }
}
