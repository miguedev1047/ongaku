import { Moon, Sun } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '../../components/ui/button'
import { useTheme } from './theme-provider'

export type ModeToggleProps = {
  label?: string
  className?: string
}

export function ModeToggle({
  label = 'Toggle theme',
  className,
}: ModeToggleProps) {
  const { resolvedMode, setMode } = useTheme()
  const isDark = resolvedMode === 'dark'

  return (
    <Button
      variant='outline'
      size='icon'
      className={className}
      aria-label={label}
      onClick={() => setMode(isDark ? 'light' : 'dark')}
    >
      <HugeiconsIcon icon={isDark ? Moon : Sun} />
    </Button>
  )
}
