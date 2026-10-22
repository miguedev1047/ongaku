import '@/lib/i18n'

import {
  HeadContent,
  Link,
  ScriptOnce,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import logo from '@ongaku/assets/logo'
import { useTranslation } from 'react-i18next'
import appCss from '@/styles/main.css?url'
import { SITE_DESCRIPTION, SITE_NAME } from '@/features/landing/constants'
import { useLanguageSync } from '@/hooks/language-sync'
import {
  ThemeProvider,
  getThemeScript,
} from '@ongaku/ui/providers/theme-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: SITE_NAME },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'theme-color', content: '#0a0a0a' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', href: logo },
      { rel: 'apple-touch-icon', href: logo },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useLanguageSync()

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
        <ScriptOnce>
          {getThemeScript({
            defaultMode: 'dark',
            defaultTheme: 'default',
            modeStorageKey: 'ongaku-mode',
            themeStorageKey: 'ongaku-theme',
          })}
        </ScriptOnce>
      </head>
      <body>
        <ThemeProvider
          defaultMode='dark'
          defaultTheme='default'
          modeStorageKey='ongaku-mode'
          themeStorageKey='ongaku-theme'
        >
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  const { t } = useTranslation('common')

  return (
    <main className='mx-auto flex min-h-svh w-full max-w-xl flex-col items-start justify-center gap-4 px-4'>
      <p className='text-2xs font-medium tracking-widest text-muted-foreground uppercase'>
        {t('notFound.eyebrow')}
      </p>
      <h1 className='landing-display font-heading text-3xl font-semibold'>
        {t('notFound.title')}
      </h1>
      <p className='text-sm text-muted-foreground'>
        {t('notFound.description')}
      </p>
      <Link
        to='/'
        className='mt-2 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50'
      >
        {t('notFound.back')}
      </Link>
    </main>
  )
}
