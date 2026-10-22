import logo from '@ongaku/assets/logo'
import { Tilt, TiltContent } from '@animate-ui/react/primitives/effects/tilt'

import { SITE_NAME } from '@/features/landing/constants'

export function Hero() {
  return (
    <section className='relative overflow-hidden pt-32 pb-8 mx-auto max-w-180 flex items-center justify-center'>
      <div className='text-center'>
        <Tilt className='rounded-md overflow-hidden'>
          <TiltContent className='size-40'>
            <img
              className='size-full object-cover'
              src={logo}
              alt='Ongaku Logo'
            />
          </TiltContent>
        </Tilt>
        <h2>{SITE_NAME}</h2>
      </div>
    </section>
  )
}
