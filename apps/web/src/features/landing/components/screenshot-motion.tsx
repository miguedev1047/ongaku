import { TopographyBackground, GridMotion } from '@ongaku/ui'
import { useTranslation } from 'react-i18next'

import { SCREENSHOT_ASSETS } from '@/features/landing/constants'

export function ScreenshootMotion() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <section className='relative mx-auto w-full space-y-12 py-20 sm:space-y-14 sm:py-24 lg:py-28'>
      <TopographyBackground className='absolute inset-0 size-full opacity-10 mask-y-from-80%' />

      <div className='relative z-20 mx-auto max-w-2xl px-4 text-center sm:px-6'>
        <h2 className='landing-display mt-3 font-heading text-2xl font-semibold sm:text-3xl'>
          {t('screenshots.title')}
        </h2>
        <p className='mt-4 text-balance text-sm leading-relaxed text-muted-foreground'>
          {t('screenshots.description')}
        </p>
      </div>

      <div className='relative z-20 h-100 w-full overflow-hidden mask-y-from-80% sm:h-140 lg:h-200'>
        <GridMotion
          className='size-full'
          rows={4}
          aspectRatio={1.33}
          gap={16}
          radius={0}
          angle={-12}
          tilt={0}
          speed={24}
          direction='alternate'
          parallax={0.5}
          spotlight={0.6}
          dim={0.35}
          fade={0.5}
          grayscale={false}
          items={SCREENSHOT_ASSETS}
        />
      </div>
    </section>
  )
}
