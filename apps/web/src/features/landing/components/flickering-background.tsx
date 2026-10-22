import { FlickeringGrid } from '@ongaku/ui'
import { cn } from 'cn'

interface FlickeringBackgroundProps extends React.ComponentProps<
  typeof FlickeringGrid
> {}

export function FlickeringBackground({
  className,
  ...props
}: FlickeringBackgroundProps) {
  return (
    <FlickeringGrid
      className={cn(className)}
      squareSize={4}
      gridGap={6}
      color='#6B7280'
      maxOpacity={0.5}
      flickerChance={0.1}
      {...props}
    />
  )
}
