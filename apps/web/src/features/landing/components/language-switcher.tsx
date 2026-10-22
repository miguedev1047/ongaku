import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@ongaku/ui/components/ui/select'
import {
  isSupportedLanguage,
  supportedLanguages,
  type SupportedLanguage,
} from '@/lib/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common')
  const current: SupportedLanguage = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'en'
  const languageItems = supportedLanguages.map((language) => ({
    value: language,
    label: t(`languages.${language}`),
  }))

  return (
    <Select
      value={current}
      onValueChange={(language) => {
        if (language) {
          void i18n.changeLanguage(language)
        }
      }}
      items={languageItems}
    >
      <SelectTrigger size='sm' aria-label={t('language')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((language) => (
          <SelectItem key={language} value={language}>
            {t(`languages.${language}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
