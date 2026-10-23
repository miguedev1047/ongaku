import { useTranslation } from 'react-i18next'

import { Badge } from '@ongaku/ui/components/ui/badge'
import { buttonVariants } from '@ongaku/ui/components/ui/button'
import { cn } from 'cn'

import { RELEASES_URL } from '@/features/landing/constants'

export function ReleaseCardFallback() {
  const { t } = useTranslation('downloads')

  return (
    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
      <div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' size='sm'>
            <span
              aria-hidden='true'
              className='size-1.5 rounded-sm bg-warning'
            />
            {t('badge')}
          </Badge>
          <span className='text-2xs tracking-wider text-muted-foreground uppercase'>
            {t('unavailable.status')}
          </span>
        </div>

        <h2 className='landing-display mt-4 font-heading text-3xl font-semibold sm:text-4xl'>
          {t('title')}
        </h2>
        <p className='mt-4 max-w-md text-sm leading-relaxed text-muted-foreground'>
          {t('unavailable.description')}
        </p>

        <a
          href={RELEASES_URL}
          target='_blank'
          rel='noopener noreferrer'
          className={cn(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'mt-7 w-full sm:w-auto',
          )}
        >
          {t('unavailable.action')}
        </a>

        <p className='mt-4 text-2xs text-muted-foreground'>{t('note')}</p>
      </div>

      <div className='rounded-md border border-border/60 bg-background/40 p-5'>
        <p className='font-heading text-sm font-medium'>
          {t('unavailable.helpTitle')}
        </p>
        <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
          {t('unavailable.helpDescription')}
        </p>
      </div>
    </div>
  )
}
