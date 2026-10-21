import { CardWrapper } from '@/components/ui/card-wrapper'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon, Sun, PaintBoardIcon } from '@hugeicons/core-free-icons'
import { useTheme } from '@/providers/theme-provider'
import { useUpdateWallpaper } from '@/features/settings/hooks/use-wallpaper'
import { useTranslation } from 'react-i18next'
import { REGISTERED_THEMES, type ThemeMode } from '@/constants/themes'
import { cn } from 'cn'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'

export const MODE_OPTIONS = [
  {
    id: 'light' as const,
    icon: Sun,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.interface_theme.light',
  },
  {
    id: 'dark' as const,
    icon: Moon,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.interface_theme.dark',
  },
] as const

export function ThemeSelection() {
  const { t } = useTranslation()
  const { mode, theme, setMode, setTheme } = useTheme()

  const updateWallpaper = useUpdateWallpaper()

  const handleSelectMode = (selectedMode: ThemeMode) => {
    setMode(selectedMode)
    updateWallpaper.mutate({ field: 'theme', value: selectedMode })
  }

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId)
    updateWallpaper.mutate({ field: 'theme_family', value: themeId })
  }

  return (
    <CardWrapper>
      <div className='flex items-center gap-2.5'>
        <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
          <HugeiconsIcon icon={PaintBoardIcon} />
        </div>
        <div>
          <h2 className='text-sm font-semibold text-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.interface_theme.title',
            )}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.interface_theme.description',
            )}
          </p>
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.interface_theme.color_mode',
          )}
        </h3>
        <RadioGroup
          value={mode}
          onValueChange={(val) => handleSelectMode(val as ThemeMode)}
          className='grid grid-cols-2 gap-2'
        >
          {MODE_OPTIONS.map((opt) => (
            <FieldLabel key={opt.id} htmlFor={`mode-${opt.id}`}>
              <Field orientation='horizontal'>
                <FieldTitle>
                  <HugeiconsIcon icon={opt.icon} />
                  <span>{t(opt.labelKey)}</span>
                </FieldTitle>
                <RadioGroupItem value={opt.id} id={`mode-${opt.id}`} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </div>

      <div className='space-y-2 pt-2 border-t border-border/50'>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.interface_theme.theme_family',
          )}
        </h3>
        <RadioGroup
          value={theme}
          onValueChange={(val) => handleSelectTheme(val as string)}
          className='grid grid-cols-2 gap-2'
        >
          {REGISTERED_THEMES.map((themeItem) => (
            <FieldLabel key={themeItem.id} htmlFor={`theme-${themeItem.id}`}>
              <Field orientation='horizontal'>
                <FieldContent className='flex flex-row'>
                  <div
                    className={cn(
                      'size-5 rounded-md border border-border/60 shrink-0 shadow-xs',
                    )}
                    style={{
                      backgroundColor:
                        mode === 'dark'
                          ? themeItem.colors.dark
                          : themeItem.colors.light,
                    }}
                    aria-hidden='true'
                  />
                  <div className='space-y-1 ml-1'>
                    <FieldTitle>{t(themeItem.nameKey)}</FieldTitle>
                    <FieldDescription>
                      {t(themeItem.descriptionKey)}
                    </FieldDescription>
                  </div>
                </FieldContent>
                <RadioGroupItem
                  value={themeItem.id}
                  id={`theme-${themeItem.id}`}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </div>
    </CardWrapper>
  )
}
