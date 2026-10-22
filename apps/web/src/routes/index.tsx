import { createFileRoute } from '@tanstack/react-router'

import { FeatureStrip } from '@/features/landing/components/feature-strip'
import { FlickeringBackground } from '@/features/landing/components/flickering-background'
import { Hero } from '@/features/landing/components/hero'
import { ReleaseSection } from '@/features/landing/components/release-section'
import { ScreenshootMarquee } from '@/features/landing/components/screenshot-marquee'
import { SiteFooter } from '@/features/landing/components/site-footer'
import { SiteHeader } from '@/features/landing/components/site-header'
import { SITE_NAME, SOCIAL_IMAGE_URL } from '@/features/landing/constants'
import { preloadLatestRelease } from '@/features/landing/queries/latest-release'
import i18n from '@/lib/i18n'
import { getDocumentLanguage } from '@/lib/language'

export const Route = createFileRoute('/')({
  head: () => {
    const language = getDocumentLanguage()
    const t = i18n.getFixedT(language, 'landing')
    const title = t('meta.title')
    const description = t('meta.description')

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: SOCIAL_IMAGE_URL },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: SOCIAL_IMAGE_URL },
      ],
    }
  },
  loader: ({ context }) => preloadLatestRelease(context.queryClient),
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='relative flex min-h-svh flex-col'>
      <FlickeringBackground className='absolute inset-x-0 z-0 h-100 w-full mask-b-from-20% mask-b-to-80%' />

      <SiteHeader />
      <main id='main' className='relative z-20 flex-1'>
        <Hero />
        <ScreenshootMarquee />
        <FeatureStrip />
        <ReleaseSection />
      </main>
      <SiteFooter />
    </div>
  )
}
