import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useLanguageSync } from '@/hooks/language-sync'
import i18n from '@/lib/i18n'
import { setLanguage } from '@/lib/language'

describe('web language sync', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    document.cookie = 'ongaku-language=; Path=/; Max-Age=0'
    document.documentElement.lang = 'en'

    await act(async () => {
      await i18n.changeLanguage('en')
    })
  })

  it('hydrates the SSR language without switching languages', async () => {
    document.documentElement.lang = 'es'

    renderHook(() => useLanguageSync('es'))

    await act(async () => {})

    expect(i18n.resolvedLanguage).toBe('es')
    expect(document.documentElement.lang).toBe('es')
    expect(window.localStorage.getItem('ongaku-language')).toBe('es')
    expect(document.cookie).toContain('ongaku-language=es')
  })

  it('updates the html lang and persistence after a language change', async () => {
    renderHook(() => useLanguageSync('en'))

    await act(async () => {
      await setLanguage('es')
    })

    expect(document.documentElement.lang).toBe('es')
    expect(window.localStorage.getItem('ongaku-language')).toBe('es')
    expect(document.cookie).toContain('ongaku-language=es')
  })
})
