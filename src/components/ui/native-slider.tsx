import { cn } from "cn"
import * as React from "react"

function NativeSlider({
  className,
  style,
  min,
  max,
  value,
  defaultValue,
  ...props
}: React.ComponentProps<"input">) {
  const minValue = Number(min ?? 0)
  const maxValue = Number(max ?? 100)
  const currentValue = Number(value ?? defaultValue ?? minValue)

  const rangeSize = maxValue - minValue
  const progress =
    rangeSize > 0 ? ((currentValue - minValue) / rangeSize) * 100 : 0

  return (
    <input
      type="range"
      data-slot="native-slider"
      min={min}
      max={max}
      value={value}
      defaultValue={defaultValue}
      className={cn("native-slider", className)}
      style={
        {
          "--slider-progress": `${Math.min(100, Math.max(0, progress))}%`,
          ...style
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { NativeSlider }
