import logo from '@ongaku/assets/logo'
import { cn } from 'cn'

interface SiteLogoProps {
  className?: string
}

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className='flex size-8 items-center justify-center overflow-hidden rounded-md bg-primary'>
        <img src={logo} alt='' className='size-full object-cover' />
      </span>
    </span>
  )
}
