import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardWrapper } from '@/components/ui/card-wrapper'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FolderIcon,
  AlertCircleIcon,
  FolderEditIcon,
} from '@hugeicons/core-free-icons'
import { Show } from '@/components/utility/show'
import { type TDirectoryHealth } from '@/shared/queries/system-health'
import { Spinner } from '@/components/ui/spinner'
import { useDirectoriesStatus } from '@/features/settings/hooks'
import { useTranslation } from 'react-i18next'

export function DirectoriesStatusCard() {
  const { t } = useTranslation()
  const {
    config,
    directories,
    pendingPath,
    isConfirmOpen,
    setIsConfirmOpen,
    isChangingDir,
    handleOpen,
    handleSelectDirectory,
    handleConfirmMove,
  } = useDirectoriesStatus()

  return (
    <CardWrapper>
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
              {t('settings.tabs.system.directories_status.title')}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {t('settings.tabs.system.directories_status.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Base Directory Block */}
      <div className='p-3 rounded-md bg-primary/5 border border-primary/20 space-y-2'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-semibold text-foreground'>
                {t('settings.tabs.system.directories_status.base_storage')}
              </span>
              <Badge
                variant='outline'
                className='text-[9px] h-4 px-1.5 text-primary border-primary/30'
              >
                {t('settings.tabs.system.directories_status.active_root')}
              </Badge>
            </div>
            <p
              className='font-mono text-xs text-muted-foreground truncate mt-1 cursor-pointer hover:text-foreground transition-colors'
              onClick={() => handleOpen(config.app_dir)}
              title={config.app_dir}
            >
              {config.app_dir}
            </p>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSelectDirectory}
              disabled={isChangingDir}
              className='h-8 px-2.5 text-xs gap-1.5'
            >
              <HugeiconsIcon
                icon={FolderEditIcon}
                className='size-3.5'
              />
              <span>{t('settings.tabs.system.directories_status.change_location')}</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleOpen(config.app_dir)}
              className='h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground'
            >
              <HugeiconsIcon
                icon={FolderIcon}
                className='size-3.5'
              />
              <span>{t('settings.tabs.system.directories_status.open')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Internal Subdirectories */}
      <div className='space-y-2'>
        <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
          {t('settings.tabs.system.directories_status.managed_directories')}
        </span>
        <div className='space-y-2'>
          {directories.map((dir: TDirectoryHealth) => (
            <div
              key={dir.id}
              className='flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30 gap-3'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold text-foreground'>
                    {dir.name}
                  </span>

                  <Show
                    when={dir.exists}
                    fallback={
                      <Badge
                        variant='destructive'
                        className='text-[9px] h-4 px-1.5'
                      >
                        {t('settings.tabs.system.directories_status.status.missing')}
                      </Badge>
                    }
                  >
                    <Badge
                      variant='outline'
                      className='text-[9px] h-4 px-1.5 text-emerald-500 border-emerald-500/30'
                    >
                      {t('settings.tabs.system.directories_status.status.exists')}
                    </Badge>
                  </Show>

                  <Show
                    when={dir.writable}
                    fallback={
                      <Badge
                        variant='destructive'
                        className='text-[9px] h-4 px-1.5'
                      >
                        {t('settings.tabs.system.directories_status.status.readonly')}
                      </Badge>
                    }
                  >
                    <Badge
                      variant='outline'
                      className='text-[9px] h-4 px-1.5 text-muted-foreground border-border/40'
                    >
                      {t('settings.tabs.system.directories_status.status.writable')}
                    </Badge>
                  </Show>
                </div>

                <p
                  className='font-mono text-[10px] text-muted-foreground truncate mt-0.5 cursor-pointer hover:text-foreground transition-colors'
                  onClick={() => handleOpen(dir.path)}
                  title={dir.path}
                >
                  {dir.path}
                </p>
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleOpen(dir.path)}
                className='h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0'
              >
                <HugeiconsIcon
                  icon={FolderIcon}
                  className='size-3.5'
                />
                <span>{t('settings.tabs.system.directories_status.open')}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Alert
        variant='destructive'
        className='bg-muted/40 border-border/40 text-destructive!'
      >
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className='size-4'
        />
        <AlertTitle className='text-xs font-semibold'>
          {t('settings.tabs.system.directories_status.notice.title')}
        </AlertTitle>
        <AlertDescription className='text-[11px]'>
          {t('settings.tabs.system.directories_status.notice.description')}
        </AlertDescription>
      </Alert>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('settings.tabs.system.directories_status.confirm_dialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.tabs.system.directories_status.confirm_dialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='p-2.5 rounded-md bg-muted/60 border border-border/50 font-mono text-xs text-foreground break-all'>
            {pendingPath}
          </div>

          <p className='text-xs text-muted-foreground'>
            {t('settings.tabs.system.directories_status.confirm_dialog.warning')}
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingDir}>
              {t('settings.tabs.system.directories_status.confirm_dialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMove}
              disabled={isChangingDir}
              className='gap-1.5'
            >
              <Show when={isChangingDir}>
                <Spinner className='size-3.5' />
              </Show>
              <span>{t('settings.tabs.system.directories_status.confirm_dialog.confirm')}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardWrapper>
  )
}
