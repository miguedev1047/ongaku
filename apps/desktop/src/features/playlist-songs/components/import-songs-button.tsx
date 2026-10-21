import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FileUploadIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import { useImportSongs } from '@/features/playlist-songs/hooks'
import { cn } from 'cn'

export interface ImportSongsButtonProps {
  playlistName: string
  variant?: 'outline' | 'default' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'icon'
  className?: string
  showText?: boolean
}

import { useTranslation } from 'react-i18next'

export function ImportSongsButton({
  playlistName,
  variant = 'outline',
  size = 'sm',
  className,
  showText = false,
}: ImportSongsButtonProps) {
  const { t } = useTranslation()
  const { importSongs, isImporting } = useImportSongs({ playlistName })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={variant}
            size={size}
            onClick={() => importSongs()}
            disabled={isImporting}
            className={cn('gap-1.5 cursor-pointer', className)}
            aria-label={t('playlists.actions.import_songs')}
          >
            <Show
              when={!isImporting}
              fallback={<Spinner className='size-3.5' />}
            >
              <HugeiconsIcon
                icon={FileUploadIcon}
                className='size-3.5'
              />
            </Show>
            <Show when={showText}>
              <span>{t('playlists.actions.import_songs')}</span>
            </Show>
          </Button>
        }
      />
      <TooltipContent side='bottom'>
        <p>{t('playlists.actions.import_songs_tooltip')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
