import demoApp13 from '@ongaku/assets/screenshots/demo-app-13.webp'
import { Button, GlassLaptop, RainbowButton, TechText } from '@ongaku/ui'
import { useTranslation } from 'react-i18next'
import { REPOSITORY_URL, SITE_NAME } from '@/features/landing/constants'
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon } from '@hugeicons/core-free-icons'

export function Hero() {
  const { t } = useTranslation(['landing', 'common', 'navigation'])

  return (
    <section className='relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-14 pb-20 text-center sm:px-6 sm:pt-20 sm:pb-28'>
      <div className='h-28 w-full sm:h-40 md:h-52'>
        <TechText
          className='h-full overflow-clip'
          text={SITE_NAME}
          fontWeight={600}
          fontSize={175}
          reveal='letter'
          dashLength={4}
          dashGap={2}
          specks={15}
          intro='assemble'
          introDuration={2}
          clickKick
          guides={false}
          fontFamily=''
          letterSpacing={-0.05}
          accentColor='currentColor'
          reach={200}
          softness={0.7}
          lineStyle='dashed'
          strokeWidth={1.5}
          speed={1}
          bounce={0.4}
          selection
          labels
          color='currentColor'
          align='center'
          draggable
          sweep
        />
      </div>

      <div className='mt-8 flex w-full flex-col items-center space-y-10 sm:mt-12 sm:space-y-12'>
        <p className='max-w-2xl text-balance text-base tracking-tight text-muted-foreground sm:text-lg md:text-xl'>
          {t('hero.description')}
        </p>

        <div className='w-full max-w-sm space-y-3 sm:max-w-none'>
          <div className='flex-col md:flex-row items-center justify-center gap-1'>
            <RainbowButton
              nativeButton={false}
              render={<a href='#download' />}
              size='lg'
              className='w-full sm:w-auto'
            >
              {t('hero.downloadNow')}
            </RainbowButton>
            <Button
              nativeButton={false}
              render={<a target='_blank' href={REPOSITORY_URL} />}
              size='lg'
              variant='outline'
              className='w-full sm:w-auto'
            >
              <HugeiconsIcon icon={GithubIcon} />
              <span className='capitalize'>{t('github')}</span>
            </Button>
          </div>
          <p className='text-xs text-balance text-muted-foreground sm:text-sm'>
            {t('hero.availability')}
          </p>
        </div>

        <GlassLaptop className='w-full'>
          <img
            src={demoApp13}
            alt={t('hero.imageAlt')}
            className='relative size-full'
          />
        </GlassLaptop>
      </div>
    </section>
  )
}
