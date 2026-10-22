import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import es from '@/locales/es.json'

export const defaultNS = 'common'
export const supportedLanguages = ['en', 'es'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const LANGUAGE_STORAGE_KEY = 'ongaku-language'
export const LANGUAGE_COOKIE_NAME = 'ongaku-language'

export const resources = {
  en,
  es,
} as const

const createInitOptions = (language: SupportedLanguage) => ({
  resources,
  defaultNS,
  ns: Object.keys(en),
  lng: language,
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

function getInitialClientLanguage(): SupportedLanguage {
  if (typeof document === 'undefined') {
    return 'en'
  }

  return resolveLanguage(document.documentElement.lang)
}

const i18n = i18next.createInstance()

if (!i18n.isInitialized) {
  void i18n
    .use(initReactI18next)
    .init(createInitOptions(getInitialClientLanguage()))
}

export function createI18nInstance(language: SupportedLanguage) {
  const instance = i18next.createInstance()

  void instance.use(initReactI18next).init(createInitOptions(language))

  return instance
}

export function isSupportedLanguage(
  value: string | null | undefined,
): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage)
}

export function resolveLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  return isSupportedLanguage(value) ? value : 'en'
}

function normalizeLanguageTag(value: string): string {
  return value.trim().toLowerCase().split('-')[0] ?? ''
}

export function resolveAcceptLanguage(
  header: string | null | undefined,
): SupportedLanguage | undefined {
  if (!header) {
    return undefined
  }

  const preferences = header
    .split(',')
    .map((part, index) => {
      const [tag, ...parameters] = part.split(';')
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      )
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.split('=')[1] ?? '')
        : 1

      return {
        language: normalizeLanguageTag(tag),
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      }
    })
    .filter((preference) => preference.language && preference.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)

  return preferences
    .map((preference) => preference.language)
    .find(isSupportedLanguage)
}

export function resolveInitialLanguage(
  cookieLanguage: string | null | undefined,
  acceptLanguage: string | null | undefined,
): SupportedLanguage {
  const fromCookie = normalizeLanguageTag(cookieLanguage ?? '')

  if (isSupportedLanguage(fromCookie)) {
    return fromCookie
  }

  return resolveAcceptLanguage(acceptLanguage) ?? 'en'
}

export default i18n
