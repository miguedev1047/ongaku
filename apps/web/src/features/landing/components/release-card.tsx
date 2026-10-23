import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowUpRight01Icon, Download04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Show } from '@ongaku/ui'
import { Badge } from '@ongaku/ui/components/ui/badge'
import { Button, buttonVariants } from '@ongaku/ui/components/ui/button'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

import { RELEASES_URL } from '@/features/landing/constants'
import { ReleaseCardFallback } from '@/features/landing/components/release-card-fallback'
import {
  MacPlatformMenu,
  PlatformDownloadLink,
} from '@/features/landing/components/release-platforms'
import { selectReleaseAsset } from '@/features/landing/lib/release-assets'
import { getReleaseTarget } from '@/features/landing/lib/release-target'
import { latestReleaseQueryOpts } from '@/features/landing/queries/latest-release'

export function ReleaseCard() {
  const { t } = useTranslation('downloads')
  const { data: release } = useSuspenseQuery(latestReleaseQueryOpts())

  if (!release) {
    return <ReleaseCardFallback />
  }

  const target = getReleaseTarget()
  const download = selectReleaseAsset(release, target)
  const windowsDownload = selectReleaseAsset(release, {
    os: 'windows',
    arch: 'x64',
  })
  const linuxDownload = selectReleaseAsset(release, {
    os: 'linux',
    arch: target.os === 'linux' ? target.arch : 'x64',
  })
  const macDownloads = {
    arm64: selectReleaseAsset(release, { os: 'macos', arch: 'arm64' }),
    x64: selectReleaseAsset(release, { os: 'macos', arch: 'x64' }),
  }

  return (
    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
      <div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline' size='sm'>
            <span
              aria-hidden='true'
              className='size-1.5 rounded-sm bg-success'
            />
            {t('badge')}
          </Badge>
          <span className='text-2xs tracking-wider text-muted-foreground uppercase'>
            {release.tagName}
          </span>
        </div>

        <h2 className='landing-display mt-4 font-heading text-3xl font-semibold sm:text-4xl'>
          {t('title')}
        </h2>
        <p className='mt-4 max-w-md text-sm leading-relaxed text-muted-foreground'>
          {t('description')}
        </p>

        <div className='mt-7 flex flex-col gap-3 sm:flex-row sm:items-center'>
          <Button
            size='lg'
            className='w-full sm:w-auto'
            render={
              <a
                href={download.url}
                target='_blank'
                rel='noopener noreferrer'
                download={download.assetName ?? undefined}
              />
            }
            nativeButton={false}
          >
            <HugeiconsIcon icon={Download04Icon} data-icon='inline-start' />
            {t('cta')}
            <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon='inline-end' />
          </Button>
          <a
            href={RELEASES_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'lg' }),
              'w-full sm:w-auto',
            )}
          >
            {t('allReleases')}
          </a>
        </div>

        <Show when={download.assetName === null}>
          <p className='mt-4 text-2xs text-warning'>{t('fallbackNote')}</p>
        </Show>
        <p className='mt-4 text-2xs text-muted-foreground'>{t('note')}</p>
      </div>

      <div className='divide-y divide-border/60 overflow-hidden rounded-md border border-border/60 bg-background/40'>
        <PlatformDownloadLink
          platform='windows'
          format='.exe'
          download={windowsDownload}
        />
        <MacPlatformMenu format='.dmg' downloads={macDownloads} />
        <PlatformDownloadLink
          platform='linux'
          format='.AppImage'
          download={linuxDownload}
        />
      </div>
    </div>
  )
}
