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
import { useYoutubeSearchBar } from '@/features/youtube-search/hooks'
import { useTranslation } from 'react-i18next'

interface YoutubeSearchBarProps {
  initialQuery?: string
}

export function YoutubeSearchBar({ initialQuery = '' }: YoutubeSearchBarProps) {
  const { t } = useTranslation()
  const {
    isOpen,
    queryInput,
    filteredHistory,
    hasTypedQuery,
    hasHistory,
    hasAnyHistory,
    hasDisplayQuery,
    setQueryInput,
    handleOpenChange,
    handleSearch,
    handleKeyDown,
    handleRemoveHistory,
    handleClearHistory,
  } = useYoutubeSearchBar({ initialQuery })

  return (
    <div className='flex items-center gap-2'>
      <Button
        onClick={() => handleOpenChange(true)}
        variant='search-trigger'
        size='sm'
        className='w-60'
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

      <CommandDialog open={isOpen} onOpenChange={handleOpenChange} size='md'>
        <Command shouldFilter={false}>
          <CommandInput
            value={queryInput}
            onValueChange={setQueryInput}
            placeholder={t('youtube_search.placeholder')}
            onKeyDown={handleKeyDown}
          />

          <CommandList className='max-h-80'>
            <Show when={hasTypedQuery}>
              <CommandGroup heading={t('youtube_search.search_action')}>
                <CommandItem
                  value={`search-action-${queryInput}`}
                  onSelect={() => handleSearch(queryInput)}
                  className='gap-2.5'
                >
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className='size-3.5 text-primary shrink-0'
                  />
                  <span className='truncate font-medium'>
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
                    value={`history-item-${item}`}
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
                    <span className='opacity-0 group-hover/history:opacity-100'>
                      <Button
                        variant='destructive-ghost'
                        size='icon-xs'
                        onClick={(e) => handleRemoveHistory(e, item)}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className='size-3' />
                      </Button>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Show>

            <Show when={!hasTypedQuery && !hasHistory}>
              <CommandEmpty>
                {t('youtube_search.no_recent_searches')}
              </CommandEmpty>
            </Show>

            <Show when={hasAnyHistory}>
              <div className='p-1 border-t border-border/40 flex justify-end'>
                <Button
                  variant='destructive-ghost'
                  size='sm'
                  onClick={handleClearHistory}
                >
                  <HugeiconsIcon icon={Delete02Icon} className='size-3' />
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
