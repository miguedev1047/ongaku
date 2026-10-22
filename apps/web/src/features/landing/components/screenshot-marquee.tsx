import { useTranslation } from 'react-i18next'
import { SCREENSHOTS } from '@/features/landing/constants'
import { ThreeDMarquee, TopographyBackground } from '@ongaku/ui'

export function ScreenshootMarquee() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <section className='mx-auto w-full py-32 relative space-y-14'>
      <TopographyBackground className='size-full inset-0 absolute opacity-20 mask-y-from-80%' />

      <div className='max-w-2xl mx-auto text-center z-20 relative'>
        <h2 className='landing-display mt-3 font-heading text-2xl font-semibold sm:text-3xl'>
          {t('screenshots.title')}
        </h2>
        <p className='mt-4 text-balance text-sm leading-relaxed text-muted-foreground'>
          {t('screenshots.description')}
        </p>
      </div>

      <div
        className='w-full relative z-20 mask-y-from-80%'
        style={{ height: '75vh' }}
      >
        <ThreeDMarquee className='size-full' images={SCREENSHOTS} />
      </div>
    </section>
  )
}
