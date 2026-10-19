import { useEffect, useState } from 'react'
import { extractColors } from 'extract-colors'
import { CoverImage } from '@/components/ui/cover-image'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import { AnimatePresence, motion } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { CardBody, CardContainer } from '@/components/ui/3d-card'
import { useLocalPlayerStore } from '@/features/player/stores'

interface SongCoverCanvasProps {
  coverUrl?: string | null
  title: string
  songId?: string
  direction?: number
  isPlaying?: boolean
  onPlayToggle?: () => void
}

export function SongCoverCanvas({
  coverUrl,
  title,
  songId,
  direction: propDirection,
  isPlaying = false,
  onPlayToggle,
}: SongCoverCanvasProps) {
  const storeDirection = useLocalPlayerStore((s) => s.direction)
  const direction = propDirection ?? storeDirection ?? 1
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
    <div className='size-full flex-1 relative overflow-hidden'>
      <AnimatePresence initial={false} mode='popLayout' custom={direction}>
        <motion.div
          key={songId}
          custom={direction}
          className='size-full p-2'
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
            center: { x: 0 },
            exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' }),
          }}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
        >
        <div
          className={cn(
            'size-full flex-1 overflow-y-auto no-scrollbar scroll-fade-y transition-colors duration-300 ease-in-out bg-background rounded-md',
            'cover-bg',
          )}
          style={{ '--cover-color': dominantColor } as React.CSSProperties}
        >
          <div className='min-h-full flex flex-col items-center justify-center p-6 sm:p-10'>
            <CardContainer className='size-100 select-none cursor-pointer active:scale-90'>
              <CardBody>
                <CoverImage
                  src={coverUrl ?? undefined}
                  alt={title}
                  className='size-full object-cover'
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
      </motion.div>
    </AnimatePresence>
    </div>
  )
}
