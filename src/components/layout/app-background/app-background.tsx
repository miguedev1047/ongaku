import { Show } from '@/components/utility/show'
import { getBackgroundUrl } from '@/lib/song-utils'
import { wallpaperQueryOpts } from '@/features/settings/queries/wallpaper'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { cn } from 'cn'

type AppBackgroundProps = React.ComponentProps<'div'>

const BLUR_CLASSES = {
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
              backgroundImage: `radial-gradient(rgba(255,255,255,1) 1px, transparent 1px), url('${url}')`,
              backgroundSize: '12px 12px, cover',
              backgroundPosition: '0 0, center',
              backgroundRepeat: 'repeat, no-repeat',
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
