import { useEffect } from 'react'

import i18n, {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  resolveLanguage,
} from '@/lib/i18n'

export function useLanguageSync() {
  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    const language = resolveLanguage(stored ?? i18n.resolvedLanguage)

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language)
    }

    document.documentElement.lang = language
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [])

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      if (!isSupportedLanguage(language)) {
        return
      }

      document.documentElement.lang = language
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])
}
