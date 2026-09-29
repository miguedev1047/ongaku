import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { openFolder } from "@/shared/helpers/open-folder"
import { toast } from "sonner"
import { Show } from "@/components/utility/show"
import { useSuspenseQuery } from "@tanstack/react-query"
import { systemHealthQueryOptions, type TDirectoryHealth } from "@/shared/queries/system"

export function DirectoriesStatusCard() {
  const { data: health } = useSuspenseQuery(systemHealthQueryOptions())
  const directories: TDirectoryHealth[] = health.directories

  const handleOpen = async (path: string) => {
    try {
      await openFolder(path)
    } catch {
      toast.error(`Failed to open folder: ${path}`)
    }
  }

  return (
    <div className="p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <HugeiconsIcon
            icon={FolderIcon}
            className="size-4"
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            System Directories & Storage
          </h2>
          <p className="text-xs text-muted-foreground">
            File system integrity, storage locations, and read/write permissions
          </p>
        </div>
      </div>

     
      <div className="space-y-2 pt-1">
        {directories.map((dir: TDirectoryHealth) => (
          <div
            key={dir.id}
            className="flex items-center justify-between p-2.5 rounded-md bg-muted/30 border border-border/30 gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {dir.name}
                </span>

                <Show
                  when={dir.exists}
                  fallback={
                    <Badge
                      variant="destructive"
                      className="text-[9px] h-4 px-1.5"
                    >
                      Missing
                    </Badge>
                  }
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 text-emerald-500 border-emerald-500/30"
                  >
                    Exists
                  </Badge>
                </Show>

                <Show
                  when={dir.writable}
                  fallback={
                    <Badge
                      variant="destructive"
                      className="text-[9px] h-4 px-1.5"
                    >
                      Read-Only
                    </Badge>
                  }
                >
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 text-muted-foreground border-border/40"
                  >
                    Writable
                  </Badge>
                </Show>
              </div>

              <p
                className="font-mono text-[10px] text-muted-foreground truncate mt-0.5 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleOpen(dir.path)}
                title={dir.path}
              >
                {dir.path}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpen(dir.path)}
              className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              <HugeiconsIcon
                icon={FolderIcon}
                className="size-3.5"
              />
              <span>Open</span>
            </Button>
          </div>
        ))}
      </div>

       <Alert variant='destructive' className="bg-muted/40 border-border/40 text-destructive!">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className="size-4"
        />
        <AlertTitle className="text-xs font-semibold">
          Notice
        </AlertTitle>
        <AlertDescription className="text-[11px]">
          Manual modifications to these directories may cause unexpected behavior or app errors.
        </AlertDescription>
      </Alert>
    </div>
  )
}
