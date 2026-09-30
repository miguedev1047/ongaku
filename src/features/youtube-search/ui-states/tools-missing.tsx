import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { AlertIcon, Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Show } from '@/components/utility/show'
import { RouteSection } from '@/components/ui/route-section'

interface InstallActionProps {
  isPending: boolean
  onInstall: () => void
}

function InstallAction({ isPending, onInstall }: InstallActionProps) {
  return (
    <Show
      when={!isPending}
      fallback={
        <Button
          disabled
          size='sm'
          className='gap-2'
        >
          <Spinner className='size-3.5' />
          Installing tools...
        </Button>
      }
    >
      <Button
        onClick={onInstall}
        size='sm'
        className='gap-2'
      >
        <HugeiconsIcon
          icon={Download01Icon}
          className='size-3.5'
        />
        Install Tools
      </Button>
    </Show>
  )
}

export function YoutubeToolsMissing({
  isPending,
  onInstall,
}: InstallActionProps) {
  return (
    <RouteSection className='flex items-center justify-center select-none'>
      <Empty className='border border-border/40 bg-card/30 max-w-lg w-full'>
        <EmptyMedia
          variant='icon'
          className='bg-amber-500/10 text-amber-500'
        >
          <HugeiconsIcon
            icon={AlertIcon}
            className='size-5'
          />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Tools Required</EmptyTitle>
          <EmptyDescription>
            YouTube search and audio playback require auxiliary binaries (
            <span className='font-mono text-foreground font-semibold'>
              yt-dlp
            </span>{' '}
            and{' '}
            <span className='font-mono text-foreground font-semibold'>
              ffmpeg
            </span>
            ). This content cannot be displayed until they are installed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <InstallAction
            isPending={isPending}
            onInstall={onInstall}
          />
        </EmptyContent>
      </Empty>
    </RouteSection>
  )
}
