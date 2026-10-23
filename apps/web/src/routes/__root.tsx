import {
  HeadContent,
  Link,
  ScriptOnce,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { type QueryClient } from '@tanstack/react-query'
import logo from '@ongaku/assets/logo'
import { I18nextProvider, useTranslation } from 'react-i18next'
import appCss from '@/styles/main.css?url'
import { useLanguageSync } from '@/hooks/language-sync'
import i18n, { createI18nInstance } from '@/lib/i18n'
import { getDocumentLanguage } from '@/lib/language'
import {
  ThemeProvider,
  getThemeScript,
} from '@ongaku/ui/providers/theme-provider'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => {
    const language = getDocumentLanguage()
    const t = i18n.getFixedT(language, 'common')

    return {
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        { title: t('site.title') },
        { name: 'description', content: t('site.description') },
        { name: 'theme-color', content: '#0a0a0a' },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', type: 'image/png', href: logo },
        { rel: 'apple-touch-icon', href: logo },
        { rel: 'manifest', href: '/manifest.json' },
      ],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const language = getDocumentLanguage()
  const instance =
    typeof document === 'undefined' ? createI18nInstance(language) : i18n

  useLanguageSync(language)

  return (
    <html lang={language} suppressHydrationWarning>
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
        <I18nextProvider i18n={instance}>
          <ThemeProvider
            defaultMode='dark'
            defaultTheme='default'
            modeStorageKey='ongaku-mode'
            themeStorageKey='ongaku-theme'
          >
            {children}
          </ThemeProvider>
        </I18nextProvider>
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
