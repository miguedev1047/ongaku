import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@ongaku/ui/components/ui/dropdown-menu'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

import type { ReleaseDownload } from '@/features/landing/lib/release-assets'

type PlatformKey = 'windows' | 'macos' | 'linux'

const ROW_CLASS =
  'flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50'

const FORMAT_CLASS =
  'rounded-sm border border-border/60 bg-muted px-1.5 py-0.5 font-sans text-2xs font-medium text-foreground'

function PlatformSummary({ platform }: { platform: PlatformKey }) {
  const { t } = useTranslation('downloads')

  return (
    <span className='flex flex-col'>
      <span className='font-heading text-sm font-medium'>
        {t(`platforms.${platform}.name`)}
      </span>
      <span className='text-2xs text-muted-foreground'>
        {t(`platforms.${platform}.hint`)}
      </span>
    </span>
  )
}

export function PlatformDownloadLink({
  platform,
  format,
  download,
}: {
  platform: Exclude<PlatformKey, 'macos'>
  format: string
  download: ReleaseDownload
}) {
  const { t } = useTranslation('downloads')

  return (
    <a
      href={download.url}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={t('platformAction', {
        platform: t(`platforms.${platform}.name`),
      })}
      className={ROW_CLASS}
    >
      <PlatformSummary platform={platform} />
      <code className={FORMAT_CLASS}>{format}</code>
    </a>
  )
}

export function MacPlatformMenu({
  format,
  downloads,
}: {
  format: string
  downloads: Record<'arm64' | 'x64', ReleaseDownload>
}) {
  const { t } = useTranslation('downloads')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type='button'
            aria-label={t('platforms.macos.choose')}
            className={cn(ROW_CLASS, 'data-popup-open:bg-muted/40')}
          >
            <PlatformSummary platform='macos' />
            <code className={FORMAT_CLASS}>{format}</code>
          </button>
        }
      />

      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('platforms.macos.choose')}</DropdownMenuLabel>
          <DropdownMenuItem
            className='cursor-pointer'
            render={
              <a
                href={downloads.arm64.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('platforms.macos.arm64')}
              </a>
            }
          />
          <DropdownMenuItem
            className='cursor-pointer'
            render={
              <a
                href={downloads.x64.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('platforms.macos.intel')}
              </a>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
