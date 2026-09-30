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

export function PlayerPositionOptions() {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const updateConfig = useUpdateConfig()

  const currentPosition = config?.player_position ?? 'bottom'

  const positionOptions = [
    {
      id: 'bottom',
      label: 'Bottom (Default)',
      icon: AlignBoxBottomCenterIcon,
    },
    {
      id: 'top',
      label: 'Top',
      icon: AlignBoxTopCenterIcon,
    },
  ] as const

  const handleSelectPosition = (position: 'bottom' | 'top') => {
    updateConfig.mutate({ key: 'player_position', value: position })
  }

  return (
    <div className='space-y-2'>
      <label className='text-xs font-medium text-foreground'>
        Player Position
      </label>
      <div className='grid grid-cols-2 gap-2'>
        {positionOptions.map((opt) => {
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
