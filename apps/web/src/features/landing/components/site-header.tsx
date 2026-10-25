import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/features/landing/components/language-switcher'
import { SiteLogo } from '@/features/landing/components/site-logo'
import { Link } from '@tanstack/react-router'
import { AnimatedThemeToggler } from '@ongaku/ui'

export function SiteHeader() {
  const { t } = useTranslation('navigation')

  return (
    <header className='w-full z-20'>
      <div className='mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6'>
        <Link
          to='/'
          className='rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          aria-label={t('home')}
        >
          <SiteLogo />
        </Link>

        <nav aria-label={t('main')} className='flex items-center gap-1.5'>
          <AnimatedThemeToggler variant='square' />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
