import { cn } from 'cn'
import * as React from 'react'

function NativeSlider({
  className,
  style,
  min,
  max,
  step = 'any',
  value,
  defaultValue,
  ...props
}: React.ComponentProps<'input'>) {
  const minValue = Number(min ?? 0)
  const maxValue = Number(max ?? 100)
  const currentValue = Number(value ?? defaultValue ?? minValue)

  const rangeSize = maxValue - minValue
  const ratio = rangeSize > 0 ? (currentValue - minValue) / rangeSize : 0
  const clampedRatio = Math.min(1, Math.max(0, ratio))
  const percentage = clampedRatio * 100

  const thumbSizePx = 12
  const centerOffsetPx = (0.5 - clampedRatio) * thumbSizePx
  const progressFill = `calc(${percentage}% + ${centerOffsetPx}px)`

  return (
    <input
      type='range'
      data-slot='native-slider'
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      className={cn('native-slider', className)}
      style={
        {
          '--slider-progress': `${percentage}%`,
          '--slider-fill': progressFill,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { NativeSlider }
