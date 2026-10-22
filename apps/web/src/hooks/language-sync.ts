import { useEffect } from 'react'

import i18n, {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  resolveLanguage,
  type SupportedLanguage,
} from '@/lib/i18n'
import { persistLanguage } from '@/lib/language'

export function useLanguageSync(initialLanguage: SupportedLanguage) {
  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    const language = resolveLanguage(stored ?? initialLanguage)

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language)
    }

    document.documentElement.lang = language
    persistLanguage(language)
  }, [initialLanguage])

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      if (!isSupportedLanguage(language)) {
        return
      }

      document.documentElement.lang = language
      persistLanguage(language)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])
}
