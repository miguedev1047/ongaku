import { Show } from '@ongaku/ui'
import { getBackgroundUrl } from '@/lib/song-utils'
import { wallpaperQueryOpts } from '@/features/settings/queries/wallpaper'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { cn } from 'cn'

type AppBackgroundProps = React.ComponentProps<'div'>

const BLUR_CLASSES = {
  none: 'blur-none',
  sm: 'blur-xs',
  md: 'blur-sm',
  lg: 'blur-md',
} as const

export function AppBackground({
  children,
  className,
  ...props
}: AppBackgroundProps) {
  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  const { data: health } = useQuery(systemHealthQueryOpts())

  const bgId = wallpaper?.selected_background
  const hasBackground = Boolean(bgId && bgId.trim().length > 0)
  const serverPort = health?.serverPort
  const blurClass = BLUR_CLASSES[wallpaper?.blur ?? 'sm'] ?? 'blur-xs'

  const backgroundUrl =
    hasBackground && serverPort
      ? getBackgroundUrl({ id: bgId!, port: serverPort })
      : null

  return (
    <div
      className={cn('relative flex-1 min-h-0 flex overflow-hidden', className)}
      {...props}
    >
      <Show when={backgroundUrl}>
        {(url) => (
          <div
            className={cn(
              'absolute inset-0 pointer-events-none opacity-40 dark:opacity-20',
              blurClass,
            )}
            style={{
              backgroundImage: `url('${url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </Show>
      <div className='relative flex-1 min-h-0 flex overflow-hidden'>
        {children}
      </div>
    </div>
  )
}
