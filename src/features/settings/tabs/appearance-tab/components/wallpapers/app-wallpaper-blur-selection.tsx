import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  useAppWallpapers,
  useAppWallpaperMutations,
} from '@/features/settings/hooks'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'
import type { WallpaperBlur } from '@/features/settings/queries/wallpaper'

const BLUR_OPTIONS: { value: WallpaperBlur; labelKey: string }[] = [
  {
    value: 'sm',
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.app_background.blur_sm',
  },
  {
    value: 'md',
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.app_background.blur_md',
  },
  {
    value: 'lg',
    labelKey:
      'settings.tabs.appearance.appearance_and_interface.app_background.blur_lg',
  },
]

export function AppWallpaperBlurSelection() {
  const { t } = useTranslation()
  const { currentBlur } = useAppWallpapers()
  const { updateBlur } = useAppWallpaperMutations()

  return (
    <div className='space-y-2.5 pt-3 border-t border-border/50'>
      <div>
        <h3 className='text-xs font-medium text-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.app_background.blur_title',
          )}
        </h3>
        <p className='text-3xs text-muted-foreground'>
          {t(
            'settings.tabs.appearance.appearance_and_interface.app_background.blur_description',
          )}
        </p>
      </div>

      <RadioGroup
        value={currentBlur}
        onValueChange={(val) => updateBlur(val as WallpaperBlur)}
        className='grid grid-cols-3 gap-2'
      >
        {BLUR_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`blur-${opt.value}`}
            className={cn(
              'flex items-center gap-2 p-2.5 rounded-md border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer select-none',
            )}
          >
            <RadioGroupItem
              value={opt.value}
              id={`blur-${opt.value}`}
            />
            <span className='text-xs text-foreground'>
              {t(opt.labelKey)}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
