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
  tabIndex = -1,
  onKeyDown,
  onPointerUp,
  ...props
}: NativeSliderProps) {
  const isControlled = value !== undefined
  const minValue = Number(min ?? 0)
  const maxValue = Number(max ?? 100)
  const currentValue = Number(value ?? defaultValue ?? minValue)

  const rangeSize = maxValue - minValue
  const ratio = rangeSize > 0 ? (currentValue - minValue) / rangeSize : 0
  const percentage = Math.min(100, Math.max(0, ratio * 100))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        ' ',
        'Space',
      ].includes(e.key)
    ) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    onPointerUp?.(e)
    e.currentTarget.blur()
  }

  return (
    <input
      type='range'
      data-slot='native-slider'
      min={min}
      max={max}
      step={step}
      tabIndex={tabIndex}
      {...(isControlled ? { value } : { defaultValue })}
      className={cn('native-slider', className)}
      style={
        {
          '--slider-progress': `${percentage}%`,
          ...style,
        } as React.CSSProperties
      }
      onKeyDown={handleKeyDown}
      onPointerUp={handlePointerUp}
      {...props}
    />
  )
}

export { NativeSlider }
export type { NativeSliderProps }
