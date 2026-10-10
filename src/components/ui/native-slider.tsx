import { cn } from 'cn'
import * as React from 'react'

type NativeSliderProps = React.ComponentProps<'input'>

function NativeSlider({
  className,
  style,
  min,
  max,
  step = 'any',
  value,
  defaultValue,
  ...props
}: NativeSliderProps) {
  const isControlled = value !== undefined
  const minValue = Number(min ?? 0)
  const maxValue = Number(max ?? 100)
  const currentValue = Number(value ?? defaultValue ?? minValue)

  const rangeSize = maxValue - minValue
  const ratio = rangeSize > 0 ? (currentValue - minValue) / rangeSize : 0
  const percentage = Math.min(100, Math.max(0, ratio * 100))

  return (
    <input
      type='range'
      data-slot='native-slider'
      min={min}
      max={max}
      step={step}
      {...(isControlled ? { value } : { defaultValue })}
      className={cn('native-slider', className)}
      style={
        {
          '--slider-progress': `${percentage}%`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { NativeSlider }
export type { NativeSliderProps }
