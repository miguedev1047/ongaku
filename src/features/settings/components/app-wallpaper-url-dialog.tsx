import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import { RECOMMENDED_WALLPAPER_SOURCES } from '@/features/settings/constants/wallpaper-sources'
import { useAppWallpaperUrlDialog } from '@/features/settings/hooks/use-app-wallpaper-url-dialog'
import { platformService } from '@/infrastructure/platform'
import {
  ArrowUpRight01Icon,
  ImageNotFound01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export interface AppWallpaperUrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (url: string) => Promise<void>
  isImporting: boolean
}

export function AppWallpaperUrlDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: AppWallpaperUrlDialogProps) {
  const { t } = useTranslation()
  const {
    urlInput,
    setUrlInput,
    previewStatus,
    setPreviewStatus,
    trimmedUrl,
    isValidUrl,
    handleSubmit,
  } = useAppWallpaperUrlDialog({
    open,
    onOpenChange,
    onImport,
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-180'>
        <DialogHeader>
          <DialogTitle>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.title',
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.description',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.label',
              )}
            </label>
            <Input
              type='url'
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t(
                'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.placeholder',
              )}
              autoComplete='off'
              disabled={isImporting}
            />
          </div>

          <div className='space-y-1.5 pt-0.5'>
            <span className='text-[11px] font-medium text-muted-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.sources_title',
              )}
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {RECOMMENDED_WALLPAPER_SOURCES.map((source) => (
                <Button
                  key={source.id}
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => platformService.openUrl(source.url)}
                  className='h-6 text-[11px] px-2 gap-1 rounded-sm border-border/60 hover:bg-accent/60'
                  title={source.description}
                >
                  <span>{source.name}</span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className='size-3 text-muted-foreground'
                  />
                </Button>
              ))}
            </div>
            <p className='text-[10px] text-muted-foreground/80 leading-normal'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.sources_hint',
              )}
            </p>
          </div>

          <Show when={isValidUrl}>
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-[11px] font-medium text-muted-foreground'>
                  {t(
                    'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.preview',
                  )}
                </span>
                <Show when={previewStatus === 'success'}>
                  <Badge
                    variant='secondary'
                    className='text-[10px] h-4 px-1.5 font-normal rounded-sm shadow-xs'
                  >
                    {t(
                      'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.preview_ready',
                    )}
                  </Badge>
                </Show>
              </div>

              <div className='relative h-36 rounded-md overflow-hidden border border-border/40 bg-muted/20 flex items-center justify-center'>
                <Show when={previewStatus === 'loading'}>
                  <div className='flex flex-col items-center gap-1.5 text-muted-foreground'>
                    <Spinner className='size-4' />
                    <span className='text-[11px]'>
                      {t(
                        'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.preview_loading',
                      )}
                    </span>
                  </div>
                </Show>

                <Show when={previewStatus === 'error'}>
                  <div className='flex flex-col items-center text-center p-3 text-muted-foreground gap-1.5'>
                    <HugeiconsIcon
                      icon={ImageNotFound01Icon}
                      className='size-6 text-destructive/80'
                    />
                    <span className='text-[11px] max-w-70 text-muted-foreground leading-tight'>
                      {t(
                        'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.preview_error',
                      )}
                    </span>
                  </div>
                </Show>

                <img
                  src={trimmedUrl}
                  alt='Preview'
                  className={cn(
                    'size-full object-cover',
                    previewStatus !== 'success' && 'hidden',
                  )}
                  onLoad={() => setPreviewStatus('success')}
                  onError={() => setPreviewStatus('error')}
                />
              </div>
            </div>
          </Show>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant='outline'
                disabled={isImporting}
              >
                {t(
                  'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.cancel',
                )}
              </Button>
            }
          />
          <Button
            type='button'
            onClick={() => handleSubmit()}
            disabled={isImporting || !urlInput.trim()}
          >
            <Show when={isImporting}>
              <Spinner className='size-3.5 mr-1.5' />
            </Show>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.submit',
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
