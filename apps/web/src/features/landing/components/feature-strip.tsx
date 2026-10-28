import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

const FEATURES = [
  { key: 'library', tone: 'bg-success' },
  { key: 'youtube', tone: 'bg-info' },
  { key: 'downloads', tone: 'bg-warning' },
  { key: 'native', tone: 'bg-primary' },
] as const

export function FeatureStrip() {
  const { t } = useTranslation('landing')

  return (
    <section className='border-y border-border/60 bg-card/20'>
      <div className='mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-16'>
        <p className='text-2xs font-medium tracking-widest text-muted-foreground uppercase'>
          {t('features.eyebrow')}
        </p>

        <div className='mt-8 grid gap-px overflow-hidden rounded-md border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4'>
          {FEATURES.map((feature) => (
            <article
              key={feature.key}
              className='flex flex-col gap-3 bg-background/80 p-5'
            >
              <span
                aria-hidden='true'
                className={cn('block size-1.5 rounded-sm', feature.tone)}
              />
              <h2 className='font-heading text-sm font-medium'>
                {t(`features.${feature.key}.title`)}
              </h2>
              <p className='text-xs leading-relaxed text-muted-foreground'>
                {t(`features.${feature.key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
