import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
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
    <CardWrapper>
      <div className='flex items-center gap-2.5'>
        <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
          <HugeiconsIcon
            icon={AlignBoxBottomCenterIcon}
            className='size-4'
          />
        </div>
        <div>
          <h2 className='text-sm font-semibold text-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.player_position.title',
            )}
          </h2>
          <p className='text-xs text-muted-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.player_position.description',
            )}
          </p>
        </div>
      </div>

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
                'h-9 text-xs gap-2 rounded-md font-medium transition-all shadow-xs cursor-pointer select-none border',
                isSelected
                  ? 'border-transparent ring-2 outline-2 ring-foreground outline-foreground'
                  : 'border-black/10 dark:border-white/10 hover:opacity-85 hover:scale-102',
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
    </CardWrapper>
  )
}
