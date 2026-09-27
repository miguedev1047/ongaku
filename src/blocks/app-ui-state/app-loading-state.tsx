import { Spinner } from "@/components/ui/spinner"

interface AppLoadingStateProps {
  message?: string
  submessage?: string
}

export function AppLoadingState({
  message = "Loading application...",
  submessage = "Preparing your music experience"
}: AppLoadingStateProps) {
  return (
    <div className="w-full h-screen min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground select-none">
      <div className="relative flex items-center justify-center size-14 rounded-xl bg-card/60 border border-border/40 shadow-sm mb-4">
        <Spinner className="absolute inset-0 size-full text-primary/30" />
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
          Ongaku
        </h3>
        <p className="text-xs font-mono text-muted-foreground animate-pulse">
          {message}
        </p>
        <span className="text-[11px] text-muted-foreground/60">
          {submessage}
        </span>
      </div>
    </div>
  )
}
