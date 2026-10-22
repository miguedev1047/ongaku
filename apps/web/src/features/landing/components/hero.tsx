import appImg13 from '@ongaku/assets/screenshots/app-img-13.png'
import { RainbowButton, TechText } from '@ongaku/ui'
import { LATEST_RELEASE_URL, SITE_NAME } from '@/features/landing/constants'
import { useTranslation } from 'react-i18next'
import { Tilt, TiltContent } from '@animate-ui/react/primitives/effects/tilt'

export function Hero() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <div className='relative'>
      <section className=' py-28 mx-auto max-w-5xl flex items-center justify-center z-20'>
        <div className='flex flex-col items-center justify-center text-center'>
          <TechText
            className='h-auto overflow-clip'
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

          <div className='space-y-12 -translate-y-2 sm:-translate-y-16 md:-translate-y-20'>
            <p className='text-lg tracking-tight text-gray-400 md:text-xl text-balance'>
              {t('hero.description')}
            </p>

            <div className='space-y-4'>
              <RainbowButton
                nativeButton={false}
                render={<a href={LATEST_RELEASE_URL} target='_blank' />}
                size='lg'
              >
                Download Now
              </RainbowButton>
              <p className='text-sm text-muted-foreground'>
                Free · For Apple silicon Macs, Windows and Linux
              </p>
            </div>

            <Tilt>
              <TiltContent>
                <img
                  src={appImg13}
                  alt='Hero Image'
                  className='relative size-full rounded-md translate-y-10'
                />
              </TiltContent>
            </Tilt>
          </div>
        </div>
      </section>
    </div>
  )
}
