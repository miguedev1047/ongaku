import { HugeiconsIcon } from '@hugeicons/react'
import { TranslateIcon } from '@hugeicons/core-free-icons'
import { useSuspenseQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/constants/data'

export function LanguageSelection() {
  const { t, i18n } = useTranslation()
  const { data: config } = useSuspenseQuery(systemConfigQueryOpts())
  const updateConfig = useUpdateConfig()

  const currentLang = config.lang ?? i18n.language ?? 'en'

  const handleLanguageChange = (value: string | null) => {
    if (!value || value === currentLang) return
    i18n.changeLanguage(value)
    document.documentElement.setAttribute('lang', value)
    updateConfig.mutate({ key: 'lang', value })
  }

  return (
    <div className='p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2.5'>
          <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
            <HugeiconsIcon
              icon={TranslateIcon}
              className='size-4'
            />
          </div>
          <div>
            <h2 className='text-sm font-semibold text-foreground'>
              {t('settings.language_title')}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {t('settings.language_desc')}
            </p>
          </div>
        </div>

        <Select
          value={currentLang}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className='w-36'>
            <SelectValue>
              {(value) => {
                const langItem = LANGUAGES.find((l) => l.value === value)
                return <span>{langItem ? t(langItem.labelKey) : value}</span>
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align='end'>
            {LANGUAGES.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
              >
                {t(item.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
