import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  Time02Icon,
  Cancel01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import { Show } from '@/components/utility/show'
import { useYoutubeSearchStore } from '@/shared/stores/actions'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

interface YoutubeSearchBarProps {
  initialQuery?: string
}

export function YoutubeSearchBar({ initialQuery = '' }: YoutubeSearchBarProps) {
  const { t } = useTranslation()
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
      setIsOpen(false)
      navigate({
        to: '/search-youtube',
        search: { q: trimmed },
      })
    },
    [addSearch, navigate],
  )

  const filteredHistory = history.filter((item) => {
    if (!queryInput.trim()) return true
    return item.toLowerCase().includes(queryInput.trim().toLowerCase())
  })

  const hasTypedQuery = Boolean(queryInput.trim())
  const hasHistory = filteredHistory.length > 0
  const hasDisplayQuery = Boolean(initialQuery.trim())

  return (
    <div className='ml-auto flex items-center gap-2'>
      <Button
        onClick={() => handleOpenChange(true)}
        variant='outline'
        className={cn(
          'w-60 justify-center items-center text-xs font-normal border-border/40 bg-background/50 hover:bg-accent/40',
        )}
        size='sm'
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className='size-3.5 mr-2 shrink-0 text-muted-foreground'
        />
        <Show
          when={hasDisplayQuery}
          fallback={
            <span className='text-muted-foreground truncate'>
              {t('youtube_search.search_bar_placeholder')}
            </span>
          }
        >
          <span className='truncate text-foreground font-medium'>
            {initialQuery}
          </span>
        </Show>
        <Kbd className='ml-auto'>⌘K</Kbd>
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <Command
          className='max-w-md rounded-lg border'
          shouldFilter={false}
        >
          <CommandInput
            value={queryInput}
            onValueChange={setQueryInput}
            placeholder={t('youtube_search.placeholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasTypedQuery) {
                e.preventDefault()
                handleSearch(queryInput)
              }
            }}
          />

          <CommandList className='max-h-80 overflow-y-auto no-scrollbar p-1'>
            <Show when={hasTypedQuery}>
              <CommandGroup heading={t('youtube_search.search_action')}>
                <CommandItem
                  value={queryInput}
                  onSelect={() => handleSearch(queryInput)}
                  className='gap-2.5 font-medium'
                >
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className='size-3.5 text-primary shrink-0'
                  />
                  <span className='truncate'>
                    {t('youtube_search.search_for', { query: queryInput })}
                  </span>
                </CommandItem>
              </CommandGroup>
            </Show>

            <Show when={hasHistory}>
              <CommandGroup heading={t('youtube_search.recent_searches')}>
                {filteredHistory.map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    onSelect={() => handleSearch(item)}
                    className='group/history flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2.5 truncate'>
                      <HugeiconsIcon
                        icon={Time02Icon}
                        className='size-3.5 text-muted-foreground shrink-0'
                      />
                      <span className='truncate'>{item}</span>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='size-5 opacity-0 group-hover/history:opacity-100 rounded-sm hover:bg-destructive/10 hover:text-destructive'
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSearch(item)
                      }}
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className='size-3'
                      />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Show>

            <Show when={!hasTypedQuery && !hasHistory}>
              <CommandEmpty>
                {t('youtube_search.no_recent_searches')}
              </CommandEmpty>
            </Show>

            <Show when={history.length > 0}>
              <div className='p-1 border-t border-border/40 flex justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  className={cn(
                    'h-6 text-[11px] text-muted-foreground hover:text-destructive gap-1 px-2 rounded-sm',
                  )}
                  onClick={clearHistory}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className='size-3'
                  />
                  <span>{t('youtube_search.clear_history')}</span>
                </Button>
              </div>
            </Show>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
