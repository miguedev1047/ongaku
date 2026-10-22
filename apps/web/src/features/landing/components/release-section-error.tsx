import { buttonVariants } from '@ongaku/ui/components/ui/button'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

import { RELEASES_URL } from '@/features/landing/constants'

export function ReleaseSectionError() {
  const { t } = useTranslation('downloads')

  return (
    <div className='flex flex-col items-start gap-3'>
      <p className='font-heading text-sm font-medium'>{t('error.title')}</p>
      <p className='max-w-md text-xs leading-relaxed text-muted-foreground'>
        {t('error.description')}
      </p>
      <a
        href={RELEASES_URL}
        target='_blank'
        rel='noreferrer'
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        {t('error.action')}
      </a>
    </div>
  )
}
