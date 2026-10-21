import { cn } from 'cn'
import React, { memo, useMemo } from 'react'

interface FolderProps {
  color?: string
  className?: string
}

function adjustHexColor(hex: string, amount: number): string {
  let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  const num = parseInt(cleanHex.slice(0, 6), 16)
  if (isNaN(num)) return '#e7bb61'
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))

  const adjustChannel = (channel: number) => {
    if (amount < 0) {
      return clamp(channel * (1 + amount))
    }
    return clamp(channel + (255 - channel) * amount)
  }

  const r = adjustChannel((num >> 16) & 0xff)
  const g = adjustChannel((num >> 8) & 0xff)
  const b = adjustChannel(num & 0xff)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const Folder = memo(function Folder({
  color = '#e7bb61',
  className = '',
}: FolderProps) {
  const folderVars = useMemo(() => {
    return {
      '--folder-tab': adjustHexColor(color, -0.09),
      '--folder-back': color,
      '--folder-front': adjustHexColor(color, 0.18),
      '--folder-shadow': `${adjustHexColor(color, -0.55)}bf`,

      '--folder-tab-dark': adjustHexColor(color, -0.28),
      '--folder-back-dark': adjustHexColor(color, -0.18),
      '--folder-front-dark': adjustHexColor(color, -0.1),
    } as React.CSSProperties
  }, [color])

  return (
    <div
      style={folderVars}
      className={cn(
        'folder-root group-focus-visible:rounded-2xl group-focus-visible:ring-2 group-focus-visible:ring-foreground/20 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background',
        className,
      )}
    >
      <div className='folder-tab' />
      <div className='folder-back' />
      <div className='folder-front' />
      <div className='absolute inset-x-5 bottom-4 h-px bg-black/10 dark:bg-white/10' />
    </div>
  )
})

export { Folder }
