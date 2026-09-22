import { MusicIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"
import { useState } from "react"

interface CoverImageProps extends React.ComponentProps<"img"> {}

export function CoverImage({ className, src, alt, ...props }: CoverImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="size-full grid place-content-center bg-accent-foreground">
        <HugeiconsIcon
          icon={MusicIcon}
          color="#fff"
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("size-full object-cover", className)}
      onError={() => setError(true)}
      {...props}
    />
  )
}
