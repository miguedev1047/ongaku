import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useAppBackgrounds } from '@/features/settings/hooks'
import { RECOMMENDED_WALLPAPER_SOURCES } from '@/features/settings/constants/wallpaper-sources'
import { platformService } from '@/infrastructure/platform'
import { getBackgroundUrl } from '@/lib/song-utils'
import {
  ArrowUpRight01Icon,
  Delete02Icon,
  FileUploadIcon,
  FolderIcon,
  ImageIcon,
  ImageNotFound01Icon,
  Link01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export function AppBackgroundsSelection() {
  const { t } = useTranslation()
  const {
    backgrounds,
    serverPort,
    currentBackground,
    isUrlDialogOpen,
    setIsUrlDialogOpen,
    urlInput,
    setUrlInput,
    isImportingFile,
    isImportingUrl,
    handleSelectBackground,
    handleImportFile,
    handleImportUrl,
    handleDelete,
    handleOpenFolder,
  } = useAppBackgrounds()

  const [previewStatus, setPreviewStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const trimmedUrl = urlInput.trim()
  const isValidUrl =
    trimmedUrl.length > 10 &&
    (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))

  useEffect(() => {
    if (isValidUrl) {
      setPreviewStatus('loading')
    } else {
      setPreviewStatus('idle')
    }
  }, [trimmedUrl, isValidUrl])

  return (
    <div className='space-y-3 pt-2 border-t border-border/30'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5'>
        <div className='space-y-0.5'>
          <div className='flex items-center gap-1.5'>
            <HugeiconsIcon
              icon={ImageIcon}
              className='size-3.5 text-muted-foreground'
            />
            <label className='text-xs font-medium text-foreground'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.title',
              )}
            </label>
          </div>
          <p className='text-[11px] text-muted-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.description',
            )}
          </p>
        </div>

        <div className='flex items-center gap-1.5 self-start sm:self-auto flex-wrap'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleImportFile}
            disabled={isImportingFile}
            className='h-7 text-xs px-2.5 gap-1.5 rounded-md'
          >
            <Show
              when={isImportingFile}
              fallback={
                <HugeiconsIcon
                  icon={FileUploadIcon}
                  className='size-3.5'
                />
              }
            >
              <Spinner className='size-3.5' />
            </Show>
            <span>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.import_file',
              )}
            </span>
          </Button>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsUrlDialogOpen(true)}
            className='h-7 text-xs px-2.5 gap-1.5 rounded-md'
          >
            <HugeiconsIcon
              icon={Link01Icon}
              className='size-3.5'
            />
            <span>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.import_url',
              )}
            </span>
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleOpenFolder}
            className='h-7 text-xs px-2 gap-1.5 rounded-md text-muted-foreground hover:text-foreground'
            title={t(
              'settings.tabs.appearance.appearance_and_interface.app_background.open_folder',
            )}
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className='size-3.5'
            />
            <span className='sr-only sm:not-sr-only'>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.open_folder',
              )}
            </span>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1'>
        <div
          onClick={() => handleSelectBackground('')}
          role='button'
          tabIndex={0}
          className={cn(
            'group relative flex flex-col items-center justify-center h-36 p-3 rounded-md border border-border/40 bg-muted/20 cursor-pointer hover:bg-accent/40 transition-all select-none',
            !currentBackground && 'border-accent-foreground/20 bg-primary/5',
          )}
        >
          <HugeiconsIcon
            icon={ImageNotFound01Icon}
            className='size-6 text-muted-foreground mb-1'
          />
          <span className='text-xs font-medium text-foreground'>
            {t(
              'settings.tabs.appearance.appearance_and_interface.app_background.default',
            )}
          </span>

          <Show when={!currentBackground}>
            <Badge
              variant='default'
              className='absolute bottom-1.5 left-1.5 h-4 px-1.5 text-[9px] font-medium rounded-sm shadow-xs'
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                className='size-2.5 mr-0.5'
              />
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.active',
              )}
            </Badge>
          </Show>
        </div>

        {backgrounds.map((bg) => {
          const isChecked = currentBackground === bg.id
          const imageUrl = serverPort
            ? getBackgroundUrl({ id: bg.id, port: serverPort })
            : ''

          return (
            <div
              key={bg.id}
              onClick={() => handleSelectBackground(bg.id)}
              role='button'
              tabIndex={0}
              className={cn(
                'group relative overflow-hidden h-36 rounded-md border border-border/40 bg-muted/20 cursor-pointer hover:border-foreground/30 transition-all select-none',
                isChecked && 'border-accent-foreground/20 bg-primary/5',
              )}
            >
              <Show when={imageUrl}>
                <img
                  src={imageUrl}
                  alt={bg.file_name}
                  className='absolute inset-0 size-full object-cover'
                  loading='lazy'
                />
              </Show>

              <div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none' />

              <Show when={isChecked}>
                <Badge
                  variant='default'
                  className='absolute bottom-1.5 left-1.5 h-4 px-1.5 text-[9px] font-medium rounded-sm shadow-xs'
                >
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className='size-2.5 mr-0.5'
                  />
                  {t(
                    'settings.tabs.appearance.appearance_and_interface.app_background.active',
                  )}
                </Badge>
              </Show>

              <button
                type='button'
                aria-label={t(
                  'settings.tabs.appearance.appearance_and_interface.app_background.delete',
                )}
                onClick={(e) => handleDelete(e, bg.id)}
                className='absolute top-1.5 right-1.5 size-6 rounded-md bg-black/60 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className='size-3.5'
                />
              </button>
            </div>
          )
        })}
      </div>

      <Dialog
        open={isUrlDialogOpen}
        onOpenChange={setIsUrlDialogOpen}
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
                disabled={isImportingUrl}
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
                  disabled={isImportingUrl}
                >
                  {t(
                    'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.cancel',
                  )}
                </Button>
              }
            />
            <Button
              type='button'
              onClick={handleImportUrl}
              disabled={isImportingUrl || !urlInput.trim()}
            >
              <Show when={isImportingUrl}>
                <Spinner className='size-3.5 mr-1.5' />
              </Show>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.submit',
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
