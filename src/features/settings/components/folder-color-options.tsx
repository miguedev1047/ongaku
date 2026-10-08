import { useState, useEffect } from 'react'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { FolderIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useQuery } from '@tanstack/react-query'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Folder } from '@/components/ui/folder'
import { Show } from '@/components/utility/show'
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
    <div className='p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <div className='size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary'>
            <HugeiconsIcon
              icon={FolderIcon}
              className='size-4'
            />
          </div>
          <div>
            <h2 className='text-sm font-semibold text-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.folder_color.title',
              )}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.folder_color.description',
              )}
            </p>
          </div>
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
        className='grid grid-cols-4 sm:grid-cols-8 gap-2'
      >
        {FOLDER_COLOR_PRESETS.map((preset) => {
          const isChecked =
            currentColor.toLowerCase() === preset.color.toLowerCase()

          return (
            <label
              className={cn(
                'relative h-10 rounded-md cursor-pointer flex items-center justify-start transition-all border border-black/10 dark:border-white/10 shadow-xs select-none',
                isChecked
                  ? 'border-accent-foreground/40'
                  : 'hover:opacity-85 hover:scale-102',
              )}
              style={{ backgroundColor: preset.color }}
            >
              <RadioGroupItem
                value={preset.color}
                className='sr-only'
              />
              <Show when={isChecked}>
                <span className='size-4 rounded-sm bg-black/25 flex items-center justify-center text-white'>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className='size-3 stroke-[2.5]'
                  />
                </span>
              </Show>
            </label>
          )
        })}
      </RadioGroup>

      <div className='flex items-center gap-2.5 pt-1'>
        <span className='text-xs text-muted-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.folder_color.custom_hex',
          )}
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
