export const TABLE_SONGS_SLOTS = {
  select: 'w-8 shrink-0 justify-center p-0',
  selectHead: 'w-8 shrink-0 justify-center p-0',
  cover: 'size-9 shrink-0 p-0',
  coverHead: 'size-9 shrink-0 justify-center p-0',
  title: 'flex-1 min-w-0 flex p-0',
  titleHead: 'flex-1 min-w-0 flex items-center gap-2 p-0',
  artist:
    'w-40 shrink-0 p-0 hidden sm:flex items-center text-xs text-muted-foreground truncate',
  artistHead: 'w-40 shrink-0 p-0 hidden sm:flex items-center',
  album:
    'w-40 shrink-0 p-0 hidden md:flex items-center text-xs text-muted-foreground truncate',
  albumHead: 'w-40 shrink-0 p-0 hidden md:flex items-center',
  duration:
    'w-16 shrink-0 justify-end p-0 text-right font-mono text-xs text-muted-foreground',
  durationHead: 'w-16 shrink-0 justify-end p-0 text-right',
  actions: 'w-9 shrink-0 justify-end p-0',
  actionsHead: 'w-9 shrink-0 p-0',
} as const
