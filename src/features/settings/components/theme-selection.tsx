import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon, Sun, ComputerIcon, PaintBoardIcon } from '@hugeicons/core-free-icons'
import { useTheme } from '@/components/compounds/theme-provider'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { useTranslation } from 'react-i18next'

export const THEME_OPTIONS = [
  {
    id: 'light',
    icon: Sun,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.interface_theme.light',
  },
  {
    id: 'dark',
    icon: Moon,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.interface_theme.dark',
  },
  {
    id: 'system',
    icon: ComputerIcon,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.interface_theme.system',
  },
] as const

export function ThemeSelection() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const updateConfig = useUpdateConfig()

  const handleSelectTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme)
    updateConfig.mutate({ key: 'theme', value: selectedTheme })
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

      <div className='grid grid-cols-3 gap-2'>
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.id

          return (
            <Button
              key={opt.id}
              variant='selectable'
              size='sm'
              aria-selected={isSelected}
              onClick={() => handleSelectTheme(opt.id)}
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
    </CardWrapper>
  )
}
