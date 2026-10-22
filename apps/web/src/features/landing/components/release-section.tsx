import { Suspense } from 'react'
import { Card } from '@ongaku/ui/components/ui/card'

import { FlickeringBackground } from '@/features/landing/components/flickering-background'
import { ReleaseCard } from '@/features/landing/components/release-card'
import { ReleaseErrorBoundary } from '@/features/landing/components/release-error-boundary'
import { ReleaseSectionError } from '@/features/landing/components/release-section-error'
import { ReleaseSectionSkeleton } from '@/features/landing/components/release-section-skeleton'

export function ReleaseSection() {
  return (
    <section
      id='download'
      className='relative mx-auto w-full max-w-4xl px-4 py-24 sm:px-6 sm:py-28'
    >
      <Card variant='default' className='relative w-full gap-8 p-6 sm:p-10'>
        <FlickeringBackground className='absolute inset-0 z-0 size-full mask-b-from-20% mask-b-to-80% h-40' />

        <div className='relative z-10'>
          <ReleaseErrorBoundary fallback={<ReleaseSectionError />}>
            <Suspense fallback={<ReleaseSectionSkeleton />}>
              <ReleaseCard />
            </Suspense>
          </ReleaseErrorBoundary>
        </div>
      </Card>
    </section>
  )
}
