import { MusicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useState } from 'react'
import { Show } from '../../components/utility/show'

interface CoverImageProps extends React.ComponentProps<'img'> {
  rounded?: 'none' | 'sm' | 'md' | 'lg'
}

const roundedMap = {
  none: 'rounded-md',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
}

export function CoverImage({
  className,
  src,
  alt,
  rounded = 'none',
  ...props
}: CoverImageProps) {
  const [error, setError] = useState(false)

  return (
    <Show
      when={!error}
      fallback={
        <div
          className={cn(
            'size-full grid place-content-center bg-accent-foreground',
            roundedMap[rounded],
          )}
        >
          <HugeiconsIcon icon={MusicIcon} color='#fff' />
        </div>
      }
    >
      <img
        src={src}
        alt={alt}
        loading='lazy'
        decoding='async'
        className={cn('size-full object-cover', roundedMap[rounded], className)}
        onError={() => setError(true)}
        {...props}
      />
    </Show>
  )
}
