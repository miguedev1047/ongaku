import { cn } from "cn";

interface SongCoverProps extends React.ComponentProps<"img"> {}

export function SongCover({ src, alt, className, ...props }: SongCoverProps) {
  return (
    <figure className={cn("size-10 overflow-hidden", className)}>
      <img src={src} alt={alt} {...props} />
    </figure>
  );
}
