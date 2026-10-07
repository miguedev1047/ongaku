import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AlignBoxBottomCenterIcon,
  AlignBoxTopCenterIcon,
} from '@hugeicons/core-free-icons'
import { useQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { useTranslation } from 'react-i18next'

export const PLAYER_POSITION_OPTIONS = [
  {
    id: 'bottom',
    icon: AlignBoxBottomCenterIcon,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.player_position.bottom',
  },
  {
    id: 'top',
    icon: AlignBoxTopCenterIcon,
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.player_position.top',
  },
] as const

export function PlayerPositionOptions() {
  const { t } = useTranslation()
  const { data: config } = useQuery(systemConfigQueryOpts())
  const updateConfig = useUpdateConfig()

  const currentPosition = config?.player_position ?? 'bottom'

  const handleSelectPosition = (position: 'bottom' | 'top') => {
    updateConfig.mutate({ key: 'player_position', value: position })
  }

  return (
    <div className='space-y-2'>
      <label className='text-xs font-medium text-foreground'>
        {t(
          'settings.tabs.appearance.appearance_and_interface.player_position.title',
        )}
      </label>
      <div className='grid grid-cols-2 gap-2'>
        {PLAYER_POSITION_OPTIONS.map((opt) => {
          const isSelected = currentPosition === opt.id

          return (
            <Button
              key={opt.id}
              variant='outline'
              size='sm'
              onClick={() => handleSelectPosition(opt.id)}
              className={cn(
                'h-9 text-xs gap-2 rounded-md font-medium border-border/40',
                isSelected &&
                  'border-accent-foreground/20 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
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
