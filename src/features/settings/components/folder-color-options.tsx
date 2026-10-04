import { useState, useEffect } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { FolderIcon } from '@hugeicons/core-free-icons'
import { useQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Folder } from '@/components/ui/folder'
import { FOLDER_COLOR_PRESETS } from '@/constants'
import { useTranslation } from 'react-i18next'

export function FolderColorOptions() {
  const { t } = useTranslation()
  const { data: config } = useQuery(systemConfigQueryOpts())
  const updateConfig = useUpdateConfig()

  const currentColor = config?.folder_colors ?? '#507dbc'
  const [customColor, setCustomColor] = useState(currentColor)

  useEffect(() => {
    if (config?.folder_colors) {
      setCustomColor(config.folder_colors)
    }
  }, [config?.folder_colors])

  const handleSelectColor = (color: string) => {
    setCustomColor(color)
    updateConfig.mutate({ key: 'folder_colors', value: color })
  }

  return (
    <div className='space-y-3 pt-2 border-t border-border/30'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-1.5'>
            <HugeiconsIcon
              icon={FolderIcon}
              className='size-3.5 text-muted-foreground'
            />
            <label className='text-xs font-medium text-foreground'>
              {t('settings.tabs.appearance.appearance_and_interface.folder_color.title')}
            </label>
          </div>
          <p className='text-[11px] text-muted-foreground'>
            {t('settings.tabs.appearance.appearance_and_interface.folder_color.description')}
          </p>
        </div>

        <div className='flex items-center gap-2 scale-75 origin-right'>
          <Folder
            items={[]}
            color={currentColor}
          />
        </div>
      </div>

      <RadioGroup
        value={currentColor}
        onValueChange={handleSelectColor}
        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2'
      >
        {FOLDER_COLOR_PRESETS.map((preset) => {
          const isChecked =
            currentColor.toLowerCase() === preset.color.toLowerCase()

          return (
            <label
              key={preset.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-md border border-border/40 bg-muted/20 cursor-pointer hover:bg-accent/40 transition-colors',
                isChecked && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem
                value={preset.color}
                className='sr-only'
              />
              <span
                className='size-3.5 rounded-sm shrink-0 border border-black/10 dark:border-white/10 shadow-xs'
                style={{ backgroundColor: preset.color }}
              />
              <span className='text-xs font-medium truncate'>
                {t(preset.labelKey)}
              </span>
            </label>
          )
        })}
      </RadioGroup>

      {/* Custom Hex Color Picker */}
      <div className='flex items-center gap-2.5 pt-1'>
        <span className='text-xs text-muted-foreground'>
          {t('settings.tabs.appearance.appearance_and_interface.folder_color.custom_hex')}
        </span>
        <div className='flex items-center gap-2'>
          <input
            type='color'
            value={customColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            className='size-7 rounded-sm border border-border/40 bg-background cursor-pointer p-0.5'
          />
          <input
            type='text'
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onBlur={() => {
              if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
                handleSelectColor(customColor)
              }
            }}
            placeholder='#507dbc'
            className='h-7 w-24 text-xs font-mono px-2 rounded-sm border border-border/40 bg-background/50 uppercase'
          />
        </div>
      </div>
    </div>
  )
}
