import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import { DROPDOWN_ACTIONS_MENU_WIDTH } from '@/constants/styles'
import {
  FileUploadIcon,
  FolderIcon,
  Link01Icon,
  MoreHorizontalSquare01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

export interface AppWallpaperActionDropdownProps {
  onImportFile: () => void
  isImportingFile: boolean
  onOpenUrlDialog: () => void
  onOpenFolder: () => void
}

export function AppWallpaperActionDropdown({
  onImportFile,
  isImportingFile,
  onOpenUrlDialog,
  onOpenFolder,
}: AppWallpaperActionDropdownProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type='button'
            variant='outline'
            size='icon'
          >
            <Show
              when={isImportingFile}
              fallback={
                <HugeiconsIcon
                  icon={MoreHorizontalSquare01Icon}
                  className='size-3.5'
                />
              }
            >
              <Spinner className='size-3.5' />
            </Show>

            <span className='sr-only'>{t('common.actions')}</span>
          </Button>
        }
      />
      <DropdownMenuContent
        align='end'
        className={cn(DROPDOWN_ACTIONS_MENU_WIDTH)}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onImportFile}
            disabled={isImportingFile}
            className='cursor-pointer gap-2'
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
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onOpenUrlDialog}
            className='cursor-pointer gap-2'
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
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onOpenFolder}
            className='cursor-pointer gap-2'
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className='size-3.5'
            />
            <span>
              {t(
                'settings.tabs.appearance.appearance_and_interface.app_background.open_folder',
              )}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
