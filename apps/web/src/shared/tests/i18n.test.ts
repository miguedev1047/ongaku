import { describe, expect, it } from 'vitest'

import i18n, {
  defaultNS,
  resolveAcceptLanguage,
  resolveInitialLanguage,
  resources,
  supportedLanguages,
} from '@/lib/i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

type Json = Record<string, unknown>

function flatten(value: Json, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      return flatten(child as Json, path)
    }
    return [path]
  })
}

describe('web i18n resources', () => {
  it('keeps only the web namespaces', () => {
    const namespaces = [
      'common',
      'downloads',
      'footer',
      'landing',
      'navigation',
    ]

    expect(Object.keys(en).sort()).toEqual(namespaces)
    expect(Object.keys(es).sort()).toEqual(namespaces)
  })

  it('keeps key parity between languages', () => {
    expect(flatten(es).sort()).toEqual(flatten(en).sort())
  })

  it('initializes a single instance with the expected defaults', () => {
    expect(defaultNS).toBe('common')
    expect(supportedLanguages).toEqual(['en', 'es'])
    expect(resources.en).toBe(en)
    expect(resources.es).toBe(es)
    expect(i18n.isInitialized).toBe(true)
  })

  it('translates with a fixed language without mutating the instance', () => {
    const tEn = i18n.getFixedT('en', 'navigation')
    const tEs = i18n.getFixedT('es', 'navigation')

    expect(tEn('download')).toBe('Download')
    expect(tEs('download')).toBe('Descargar')
  })

  it('has a non-empty translation for every key in both languages', () => {
    for (const language of supportedLanguages) {
      for (const namespace of Object.keys(en)) {
        const source = (en as Record<string, Json>)[namespace]
        const t = i18n.getFixedT(language, namespace)

        for (const key of flatten(source)) {
          const translated = String(t(key, { year: 2026 }))

          expect(translated).not.toBe(key)
          expect(translated.length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('web language resolution', () => {
  it('prefers a supported cookie over the accept-language header', () => {
    expect(resolveInitialLanguage('es', 'en-US,en;q=0.9')).toBe('es')
    expect(resolveInitialLanguage('en', 'es-MX,es;q=0.9')).toBe('en')
  })

  it('uses the accept-language header when the cookie is invalid', () => {
    expect(resolveInitialLanguage('de', 'es-ES,es;q=0.9,en;q=0.8')).toBe('es')
    expect(resolveInitialLanguage(undefined, 'en-GB,en;q=0.9')).toBe('en')
  })

  it('honours accept-language quality weights and regional variants', () => {
    expect(resolveAcceptLanguage('en;q=0.4,es-MX;q=0.9')).toBe('es')
    expect(resolveAcceptLanguage('fr-FR,fr;q=0.9,en;q=0.8')).toBe('en')
    expect(resolveAcceptLanguage('de-DE,de;q=0.9')).toBeUndefined()
  })

  it('falls back to english when no preference is usable', () => {
    expect(resolveInitialLanguage(undefined, undefined)).toBe('en')
    expect(resolveInitialLanguage('', '')).toBe('en')
    expect(resolveInitialLanguage('fr', 'it-IT')).toBe('en')
    expect(resolveAcceptLanguage(undefined)).toBeUndefined()
  })
})
