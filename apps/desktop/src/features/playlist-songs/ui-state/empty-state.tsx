import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useParams } from "@tanstack/react-router"
import { ImportSongsButton } from "@/features/playlist-songs/components/import-songs-button"
import { cn } from "cn"

import { Show } from "@/components/utility/show"

export interface PlaylistSongsEmptyStateProps {
  className?: string
  playlistName?: string
}

import { useTranslation } from "react-i18next"

export function PlaylistSongsEmptyState({
  className,
  playlistName: propPlaylistName,
}: PlaylistSongsEmptyStateProps) {
  const { t } = useTranslation()
  const params = useParams({ strict: false }) as { playlistName?: string }
  const playlistName = propPlaylistName || params.playlistName || ""

  return (
    <div
      className={cn(
        "size-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground select-none",
        className
      )}
    >
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={MusicNote01Icon} />
          </EmptyMedia>
          <EmptyTitle>{t('playlists.songs_empty.title')}</EmptyTitle>
          <EmptyDescription>
            {t('playlists.songs_empty.description')}
          </EmptyDescription>
        </EmptyHeader>
        <Show when={Boolean(playlistName)}>
          <EmptyContent>
            <ImportSongsButton
              playlistName={playlistName}
              showText
              variant="outline"
              className="mt-2"
            />
          </EmptyContent>
        </Show>
      </Empty>
    </div>
  )
}
