import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/features/landing/components/hero'
import { ReleaseSection } from '@/features/landing/components/release-section'
import { ScreenshootMarquee } from '@/features/landing/components/screenshot-marquee'
import { SiteFooter } from '@/features/landing/components/site-footer'
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  SOCIAL_IMAGE_URL,
} from '@/features/landing/constants'
import { FlickeringBackground } from '@/features/landing/components/flickering-background'
import { SiteHeader } from '@/features/landing/components/site-header'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Ongaku' },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: SOCIAL_IMAGE_URL },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: SOCIAL_IMAGE_URL },
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className='flex min-h-svh flex-col relative'>
      <FlickeringBackground className='absolute inset-x-0 z-0 size-full mask-b-from-20% mask-b-to-80% h-100' />

      <SiteHeader />
      <main id='main' className='flex-1 relative z-20'>
        <Hero />
        <ScreenshootMarquee />
        <ReleaseSection />
      </main>
      <SiteFooter />
    </div>
  )
}
