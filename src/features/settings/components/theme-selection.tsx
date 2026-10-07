import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon, Sun, ComputerIcon } from '@hugeicons/core-free-icons'
import { useTheme } from '@/components/theme-provider'
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
    <div className='space-y-2'>
      <label className='text-xs font-medium text-foreground'>
        {t(
          'settings.tabs.appearance.appearance_and_interface.interface_theme.title',
        )}
      </label>
      <div className='grid grid-cols-3 gap-2'>
        {THEME_OPTIONS.map((opt) => {
          const isSelected = theme === opt.id

          return (
            <Button
              key={opt.id}
              variant='outline'
              size='sm'
              onClick={() => handleSelectTheme(opt.id)}
              className={cn(
                'h-9 text-xs gap-2 rounded-md font-medium border-border/40',
                isSelected &&
                  'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary border-accent-foreground/20',
              )}
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
  )
}
