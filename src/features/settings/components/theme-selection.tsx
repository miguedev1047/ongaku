import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon, Sun, ComputerIcon } from '@hugeicons/core-free-icons'
import { useTheme } from '@/components/theme-provider'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'

export function ThemeSelection() {
  const { theme, setTheme } = useTheme()
  const updateConfig = useUpdateConfig()

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: ComputerIcon },
  ] as const

  const handleSelectTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme)
    updateConfig.mutate({ key: 'theme', value: selectedTheme })
  }

  return (
    <div className='space-y-2'>
      <label className='text-xs font-medium text-foreground'>
        Interface Theme
      </label>
      <div className='grid grid-cols-3 gap-2'>
        {themeOptions.map((opt) => {
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
                  'border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
              )}
            >
              <HugeiconsIcon
                icon={opt.icon}
                className='size-3.5'
              />
              <span>{opt.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
