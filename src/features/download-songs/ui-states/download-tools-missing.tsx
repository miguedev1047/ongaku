import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { AlertIcon, Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Show } from '@/components/utility/show'
import { RouteSection } from '@/components/ui/route-section'
import { useTranslation } from 'react-i18next'

interface DownloadToolsMissingProps {
  isPending: boolean
  onInstall: () => void
}

export function DownloadToolsMissing({
  isPending,
  onInstall,
}: DownloadToolsMissingProps) {
  const { t } = useTranslation()

  return (
    <RouteSection className='flex items-center justify-center select-none'>
      <Empty className='border border-border/40 bg-card/30 max-w-lg w-full'>
        <EmptyMedia
          variant='icon'
          className='bg-amber-500/10 text-amber-500'
        >
          <HugeiconsIcon
            icon={AlertIcon}
            className='size-5'
          />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('download_songs.tools_missing.title')}</EmptyTitle>
          <EmptyDescription>
            {t('download_songs.tools_missing.description')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Show
            when={!isPending}
            fallback={
              <Button
                disabled
                size='sm'
                className='gap-2'
              >
                <Spinner className='size-3.5' />
                {t('download_songs.tools_missing.installing')}
              </Button>
            }
          >
            <Button
              onClick={onInstall}
              size='sm'
              className='gap-2'
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className='size-3.5'
              />
              {t('download_songs.tools_missing.install_button')}
            </Button>
          </Show>
        </EmptyContent>
      </Empty>
    </RouteSection>
  )
}
