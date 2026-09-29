import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { Show } from "@/components/utility/show"

interface SettingsHeaderProps {
  isLoading: boolean
  onRefresh: () => void
}

export function SettingsHeader({ isLoading, onRefresh }: SettingsHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border/40 shrink-0">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Settings & System Status
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Monitor application health, streaming services, system directories, and preferences
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-8 gap-2 text-xs"
      >
        <Show
          when={!isLoading}
          fallback={<Spinner className="size-3.5" />}
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            className="size-3.5"
          />
        </Show>
        <span>Refresh Status</span>
      </Button>
    </header>
  )
}
