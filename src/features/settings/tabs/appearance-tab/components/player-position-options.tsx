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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Field, FieldLabel, FieldTitle } from '@/components/ui/field'

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
          <HugeiconsIcon icon={AlignBoxBottomCenterIcon} />
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

      <RadioGroup
        value={currentPosition}
        onValueChange={(val) => handleSelectPosition(val as 'bottom' | 'top')}
        className='grid grid-cols-2 gap-2'
      >
        {PLAYER_POSITION_OPTIONS.map((opt) => (
          <FieldLabel key={opt.id} htmlFor={opt.id}>
            <Field orientation='horizontal'>
              <FieldTitle>
                <HugeiconsIcon icon={opt.icon} />
                <span>{t(opt.labelKey)}</span>
              </FieldTitle>
              <RadioGroupItem value={opt.id} id={opt.id} />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </CardWrapper>
  )
}
