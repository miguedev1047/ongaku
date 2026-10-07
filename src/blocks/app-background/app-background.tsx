import { Show } from '@/components/utility/show'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useQuery } from '@tanstack/react-query'
import { cn } from 'cn'

interface AppBackgroundProps extends React.ComponentProps<'div'> {}

export function AppBackground({ children, className, ...props }: AppBackgroundProps) {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const { data: health } = useQuery(systemHealthQueryOpts())

  const bgId = config?.app_background
  const hasBackground = Boolean(bgId && bgId.trim().length > 0)
  const serverPort = health?.serverPort

  const backgroundUrl =
    hasBackground && serverPort
      ? `http://localhost:${serverPort}/api/background?id=${encodeURIComponent(bgId!)}`
      : null

  return (
    <div
      className={cn('relative flex-1 min-h-0 flex overflow-hidden', className)}
      {...props}
    >
      <Show when={backgroundUrl}>
        {(url) => (
          <div
            className='absolute inset-0 pointer-events-none opacity-40 dark:opacity-20'
            style={{
              backgroundImage: `url('${url}')`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
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
