import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

export function EmptyResultsView() {
  const { t } = useTranslation()

  return (
    <div className='flex-1 flex items-center justify-center py-12 text-center text-muted-foreground select-none'>
      <Empty className='py-8 max-w-md'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <HugeiconsIcon
              icon={Download01Icon}
              className='size-5 text-muted-foreground/70'
            />
          </EmptyMedia>
          <EmptyTitle>{t('download_songs.empty.title')}</EmptyTitle>
          <EmptyDescription>
            {t('download_songs.empty.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
