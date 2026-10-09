import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { WifiOff01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { RouteSection } from '@/components/ui/route-section'

interface DownloadSongsOfflineProps {
  className?: string
}

export function DownloadSongsOffline({ className }: DownloadSongsOfflineProps) {
  const { t } = useTranslation()

  return (
    <RouteSection
      className={cn(
        'size-full flex items-center justify-center text-center p-8 select-none',
        className
      )}
    >
      <Empty className='py-16 max-w-md'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <HugeiconsIcon
              icon={WifiOff01Icon}
              className='size-6 text-muted-foreground/70'
            />
          </EmptyMedia>
          <EmptyTitle>{t('download_songs.offline.title')}</EmptyTitle>
          <EmptyDescription>
            {t('download_songs.offline.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </RouteSection>
  )
}
