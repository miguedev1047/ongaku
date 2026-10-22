import { useTranslation } from 'react-i18next'
import { Skeleton } from '@ongaku/ui'

const SKELETON_ROWS = ['one', 'two', 'three'] as const

export function ReleaseSectionSkeleton() {
  const { t } = useTranslation('downloads')

  return (
    <div
      role='status'
      aria-label={t('loading')}
      aria-busy='true'
      className='grid gap-10 lg:grid-cols-2 lg:items-center'
    >
      <div className='space-y-4'>
        <Skeleton className='h-5 w-40 rounded-sm' />
        <Skeleton className='h-9 w-3/4 rounded-sm' />
        <Skeleton className='h-4 w-full rounded-sm' />
        <Skeleton className='h-4 w-5/6 rounded-sm' />
        <div className='flex flex-col gap-3 pt-3 sm:flex-row'>
          <Skeleton className='h-8 w-full rounded-md sm:w-44' />
          <Skeleton className='h-8 w-full rounded-md sm:w-28' />
        </div>
        <Skeleton className='h-3 w-52 rounded-sm' />
      </div>

      <div className='divide-y divide-border/60 rounded-md border border-border/60'>
        {SKELETON_ROWS.map((row) => (
          <div
            key={row}
            className='flex items-center justify-between gap-4 px-5 py-4'
          >
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20 rounded-sm' />
              <Skeleton className='h-3 w-32 rounded-sm' />
            </div>
            <Skeleton className='h-5 w-16 rounded-sm' />
          </div>
        ))}
      </div>
    </div>
  )
}
