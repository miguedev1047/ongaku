import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { openFolder } from '@/shared/helpers/open-folder'
import { toast } from 'sonner'
import { Show } from '@/components/utility/show'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  systemHealthQueryOpts,
  type TDirectoryHealth,
} from '@/shared/queries/system-health'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import {
  useChangeAppDir,
  selectDirectory,
} from '@/features/settings/hooks/use-config'
import { Spinner } from '@/components/ui/spinner'

export function DirectoriesStatusCard() {
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const { data: config } = useSuspenseQuery(systemConfigQueryOpts())
  const directories: TDirectoryHealth[] = health.directories

  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { mutate: changeAppDir, isPending: isChangingDir } = useChangeAppDir()

  const handleOpen = async (path: string) => {
    try {
      await openFolder(path)
    } catch {
      toast.error(`Failed to open folder: ${path}`)
    }
  }

  const handleSelectDirectory = async () => {
    try {
      const selected = await selectDirectory()
      if (selected) {
        setPendingPath(selected)
        setIsConfirmOpen(true)
      }
    } catch {
      toast.error('Failed to select directory')
    }
  }

  const handleConfirmMove = () => {
    if (!pendingPath) return
    changeAppDir(pendingPath, {
      onSettled: () => {
        setIsConfirmOpen(false)
        setPendingPath(null)
      },
    })
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
              System Directories & Storage
            </h2>
            <p className='text-xs text-muted-foreground'>
              File system integrity, storage locations, and read/write
              permissions
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
                Base Storage Location
              </span>
              <Badge
                variant='outline'
                className='text-[9px] h-4 px-1.5 text-primary border-primary/30'
              >
                Active Root
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
              <span>Change Location</span>
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
              <span>Open</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Internal Subdirectories */}
      <div className='space-y-2'>
        <span className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
          Managed Directories
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
                        Missing
                      </Badge>
                    }
                  >
                    <Badge
                      variant='outline'
                      className='text-[9px] h-4 px-1.5 text-emerald-500 border-emerald-500/30'
                    >
                      Exists
                    </Badge>
                  </Show>

                  <Show
                    when={dir.writable}
                    fallback={
                      <Badge
                        variant='destructive'
                        className='text-[9px] h-4 px-1.5'
                      >
                        Read-Only
                      </Badge>
                    }
                  >
                    <Badge
                      variant='outline'
                      className='text-[9px] h-4 px-1.5 text-muted-foreground border-border/40'
                    >
                      Writable
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
                <span>Open</span>
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
        <AlertTitle className='text-xs font-semibold'>Notice</AlertTitle>
        <AlertDescription className='text-[11px]'>
          Manual modifications to these directories may cause unexpected
          behavior or app errors.
        </AlertDescription>
      </Alert>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Storage Location</AlertDialogTitle>
            <AlertDialogDescription>
              Ongaku will move your music library, playlists, cache, and
              database to the selected directory:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='p-2.5 rounded-md bg-muted/60 border border-border/50 font-mono text-xs text-foreground break-all'>
            {pendingPath}
          </div>

          <p className='text-xs text-muted-foreground'>
            Any active audio playback will be stopped immediately, and data will
            be migrated to the new location.
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingDir}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMove}
              disabled={isChangingDir}
              className='gap-1.5'
            >
              <Show when={isChangingDir}>
                <Spinner className='size-3.5' />
              </Show>
              <span>Change Location</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
