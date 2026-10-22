import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "@/locales/en.json"
import es from "@/locales/es.json"

export const defaultNS = "common"
export const supportedLanguages = ["en", "es"] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const LANGUAGE_STORAGE_KEY = "ongaku-language"

export const resources = {
  en,
  es,
} as const

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    defaultNS,
    ns: Object.keys(en),
    lng: "en",
    fallbackLng: "en",
    supportedLngs: [...supportedLanguages],
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
}

export function isSupportedLanguage(
  value: string | null | undefined,
): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage)
}

export function resolveLanguage(
  value: string | null | undefined,
): SupportedLanguage {
  return isSupportedLanguage(value) ? value : "en"
}

export default i18n
