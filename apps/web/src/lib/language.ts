import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie, getRequestHeaders } from '@tanstack/react-start/server'

import i18n, {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  resolveInitialLanguage,
  resolveLanguage,
  type SupportedLanguage,
} from '@/lib/i18n'

const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const getDocumentLanguage = createIsomorphicFn()
  .server(() =>
    resolveInitialLanguage(
      getCookie(LANGUAGE_COOKIE_NAME),
      getRequestHeaders().get('accept-language'),
    ),
  )
  .client(() => {
    const rendered = document.documentElement.lang

    if (isSupportedLanguage(rendered)) {
      return rendered
    }

    return resolveLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
  })

export function persistLanguage(language: SupportedLanguage) {
  if (typeof window === 'undefined') {
    return
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; Path=/; SameSite=Lax; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}${secure}`
}

export function setLanguage(language: SupportedLanguage) {
  persistLanguage(language)
  return i18n.changeLanguage(language)
}
