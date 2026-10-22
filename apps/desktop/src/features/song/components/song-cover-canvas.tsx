import { useEffect, useState } from 'react'
import { extractColors } from 'extract-colors'
import { CoverImage } from '@ongaku/ui'
import { cn } from 'cn'
import { Show } from '@ongaku/ui'
import { BarVisualizer } from '@ongaku/ui'
import { useAudioVisualizerSource } from '@/features/song/hooks'
import { AnimatePresence, motion } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons'
import { useLocalPlayerStore } from '@/features/player/stores'
import { Tilt, TiltContent } from '@animate-ui/react/primitives/effects/tilt'
import { useCanGoBack, useRouter } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'

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
  'use no memo'

  const storeDirection = useLocalPlayerStore((s) => s.direction)
  const direction = propDirection ?? storeDirection ?? 1

  const visualizerSource = useAudioVisualizerSource(true)
  const [dominantColor, setDominantColor] = useState<string | null>(null)

  const canGoBack = useCanGoBack()
  const router = useRouter()

  const handleBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ to: '/' })
    }
  }

  useHotkey({ key: 'Escape' }, () => {
    handleBack()
  })

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
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={songId}
          custom={direction}
          className='size-full absolute inset-0 p-2 transform-gpu will-change-transform'
          style={{ backfaceVisibility: 'hidden' }}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
            center: { x: 0 },
            exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' }),
          }}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <div
            className={cn(
              'size-full relative flex-1 overflow-y-auto no-scrollbar scroll-fade-y transition-colors duration-300 ease-in-out bg-background rounded-md',
              'cover-bg',
            )}
            style={{ '--cover-color': dominantColor } as React.CSSProperties}
          >
            <BarVisualizer
              source={visualizerSource}
              align='end'
              barCount={90}
              className='absolute -bottom-1 inset-x-0 h-20 w-full text-background/80 dark:text-foreground/80 pointer-events-none z-10'
            />

            <div className='min-h-full flex flex-col items-center justify-center p-6 sm:p-10'>
              <Tilt className='size-100! select-none cursor-pointer'>
                <TiltContent className='size-full'>
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
                </TiltContent>
              </Tilt>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
