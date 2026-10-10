import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon, Sun, PaintBoardIcon } from '@hugeicons/core-free-icons'
import { useTheme } from '@/components/compounds/theme-provider'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { useTranslation } from 'react-i18next'
import { REGISTERED_THEMES, type ThemeMode } from '@/constants/themes'
import { cn } from 'cn'

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
  const { mode, setMode, theme, setTheme } = useTheme()
  const updateConfig = useUpdateConfig()

  const handleSelectMode = (selectedMode: ThemeMode) => {
    setMode(selectedMode)
    updateConfig.mutate({ key: 'theme', value: selectedMode })
  }

  const handleSelectTheme = (themeId: string) => {
    setTheme(themeId)
    updateConfig.mutate({ key: 'theme_family', value: themeId })
  }

  return (
    <CardWrapper>
      <div className='flex items-center gap-2.5'>
        <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
          <HugeiconsIcon
            icon={PaintBoardIcon}
            className='size-4'
          />
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

      {/* 1. Color Mode Section (Light / Dark / System) */}
      <div className='space-y-2'>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.interface_theme.color_mode',
          )}
        </h3>
        <div className='grid grid-cols-2 gap-2'>
          {MODE_OPTIONS.map((opt) => {
            const isSelected = mode === opt.id

            return (
              <Button
                key={opt.id}
                variant='selectable'
                size='sm'
                aria-selected={isSelected}
                onClick={() => handleSelectMode(opt.id)}
                className='h-9'
              >
                <HugeiconsIcon
                  icon={opt.icon}
                  className='size-3.5'
                />
                <span>{t(opt.labelKey)}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 2. Theme Family Palette Section */}
      <div className='space-y-2 pt-2 border-t border-border/50'>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.interface_theme.theme_family',
          )}
        </h3>
        <div className='grid grid-cols-2 gap-2'>
          {REGISTERED_THEMES.map((themeItem) => {
            const isSelected = theme === themeItem.id

            return (
              <Button
                key={themeItem.id}
                variant='selectable'
                size='sm'
                aria-selected={isSelected}
                onClick={() => handleSelectTheme(themeItem.id)}
                className='h-11 justify-start'
              >
                {/* Big Preview Dot with theme color respecting default radius */}
                <div
                  className={cn(
                    'size-5 rounded-md border border-border/60 shrink-0 shadow-xs'
                  )}
                  style={{
                    backgroundColor:
                      mode === 'dark'
                        ? themeItem.colors.dark
                        : themeItem.colors.light,
                  }}
                  aria-hidden='true'
                />
                <div className='text-left leading-tight truncate ml-1'>
                  <div className='font-medium text-xs text-foreground'>
                    {t(themeItem.nameKey)}
                  </div>
                  <div className='text-3xs text-muted-foreground truncate'>
                    {t(themeItem.descriptionKey)}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </CardWrapper>
  )
}
