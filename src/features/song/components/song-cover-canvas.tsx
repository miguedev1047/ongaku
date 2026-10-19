import { useEffect, useState } from 'react'
import { extractColors } from 'extract-colors'
import { CoverImage } from '@/components/ui/cover-image'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import { HugeiconsIcon } from '@hugeicons/react'
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { CardBody, CardContainer } from '@/components/ui/3d-card'

interface SongCoverCanvasProps {
  coverUrl?: string | null
  title: string
  isPlaying?: boolean
  onPlayToggle?: () => void
}

export function SongCoverCanvas({
  coverUrl,
  title,
  isPlaying = false,
  onPlayToggle,
}: SongCoverCanvasProps) {
  const [dominantColor, setDominantColor] = useState<string | null>(null)

  useEffect(() => {
    if (!coverUrl) {
      setDominantColor(null)
      return
    }

    let active = true
    extractColors(coverUrl)
      .then((colors) => {
        if (active) {
          setDominantColor(colors[0]?.hex ?? null)
        }
      })
      .catch(() => {
        if (active) setDominantColor(null)
      })

    return () => {
      active = false
    }
  }, [coverUrl])

  return (
    <div className='size-full p-2'>
      <div
        className={cn(
          'size-full flex-1 overflow-y-auto no-scrollbar scroll-fade-y transition-colors duration-300 ease-in-out bg-background rounded-md',
          'cover-bg',
        )}
        style={{ '--cover-color': dominantColor } as React.CSSProperties}
      >
        <div className='min-h-full flex flex-col items-center justify-center p-6 sm:p-10'>
          <CardContainer className="size-100 select-none cursor-pointer active:scale-90">
            <CardBody>
              <CoverImage
                src={coverUrl ?? undefined}
                alt={title}
                className="size-full object-cover"
              />
              <Show when={Boolean(onPlayToggle)}>
                <div
                  className={cn(
                    'absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-xs',
                  )}
                >
                  <div className='size-14 rounded-xl bg-white/90 text-black flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105'>
                    <Show
                      when={isPlaying}
                      fallback={
                        <HugeiconsIcon
                          icon={PlayIcon}
                          className='size-7 ml-0.5'
                        />
                      }
                    >
                      <HugeiconsIcon icon={PauseIcon} className='size-7' />
                    </Show>
                  </div>
                </div>
              </Show>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    </div>
  )
}
