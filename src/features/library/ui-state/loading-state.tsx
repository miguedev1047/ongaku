import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import { cn } from "cn"

export function LibraryStatsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2 p-4 rounded-lg border border-foreground/10 bg-card">
        <Skeleton className="h-3 w-16 rounded-sm opacity-70" />
        <Skeleton className="h-8 w-12 rounded-sm" />
      </div>
      <div className="flex flex-col gap-2 p-4 rounded-lg border border-foreground/10 bg-card">
        <Skeleton className="h-3 w-16 rounded-sm opacity-70" />
        <Skeleton className="h-8 w-12 rounded-sm" />
      </div>
    </div>
  )
}

export interface LibraryLoadingStateProps {
  count?: number
  className?: string
}

const DEFAULT_ROW_WIDTHS = [
  { title: "w-48", subtitle: "w-28", artist: "w-32", album: "w-32", time: "w-10" },
  { title: "w-64", subtitle: "w-36", artist: "w-28", album: "w-36", time: "w-8" },
  { title: "w-40", subtitle: "w-24", artist: "w-36", album: "w-28", time: "w-11" },
  { title: "w-56", subtitle: "w-32", artist: "w-32", album: "w-40", time: "w-9" },
  { title: "w-52", subtitle: "w-20", artist: "w-24", album: "w-32", time: "w-10" },
  { title: "w-60", subtitle: "w-28", artist: "w-36", album: "w-36", time: "w-8" },
  { title: "w-44", subtitle: "w-36", artist: "w-32", album: "w-24", time: "w-12" },
  { title: "w-52", subtitle: "w-24", artist: "w-28", album: "w-32", time: "w-9" }
]

export function LibraryLoadingState({
  count = 8,
  className
}: LibraryLoadingStateProps) {
  return (
    <div
      className={cn(
        "relative size-full flex flex-col overflow-hidden border border-border/40 rounded-xl bg-card/40 select-none",
        className
      )}
      aria-label="Loading library tracks"
      aria-busy="true"
    >
      <Table
        variant="flex"
        className="size-full flex flex-col overflow-hidden rounded-md"
      >
        {/* Table Header: matches LibrarySongsList columns */}
        <TableHeader className="shrink-0 bg-muted/20 border-b border-border/40">
          <TableRow className="border-b-0 hover:bg-transparent px-3 h-10 gap-3">
            <TableHead className="w-8 shrink-0 justify-center p-0">
              <Skeleton className="size-4 rounded-sm" />
            </TableHead>
            <TableHead className="size-9 shrink-0 justify-center p-0">
              Cover
            </TableHead>
            <TableHead className="flex-1 min-w-0 flex items-center gap-2 p-0">
              <span>Title</span>
            </TableHead>
            <TableHead className="w-40 shrink-0 p-0 hidden sm:flex items-center">
              Artist
            </TableHead>
            <TableHead className="w-40 shrink-0 p-0 hidden md:flex items-center">
              Album
            </TableHead>
            <TableHead className="w-16 shrink-0 justify-end p-0 text-right">
              Time
            </TableHead>
            <TableHead className="w-9 shrink-0 p-0" />
          </TableRow>
        </TableHeader>

        {/* Skeleton Rows */}
        <TableBody className="flex-1 min-h-0 w-full overflow-hidden p-0">
          {Array.from({ length: count }).map((_, i) => {
            const width = DEFAULT_ROW_WIDTHS[i % DEFAULT_ROW_WIDTHS.length]
            return (
              <TableRow
                key={i}
                className="w-full h-14 px-3 gap-3 border-b border-border/20 hover:bg-transparent"
              >
                <TableCell className="w-8 shrink-0 justify-center p-0">
                  <Skeleton className="size-4 rounded-sm" />
                </TableCell>
                <TableCell className="size-9 shrink-0 p-0">
                  <Skeleton className="size-9 rounded-md" />
                </TableCell>
                <TableCell className="flex-1 min-w-0 flex flex-col gap-1.5 p-0">
                  <Skeleton className={cn("h-3.5 rounded-sm", width.title)} />
                  <Skeleton
                    className={cn("h-2.5 rounded-sm opacity-60", width.subtitle)}
                  />
                </TableCell>
                <TableCell className="w-40 shrink-0 hidden sm:flex items-center p-0">
                  <Skeleton className={cn("h-3 rounded-sm opacity-60", width.artist)} />
                </TableCell>
                <TableCell className="w-40 shrink-0 hidden md:flex items-center p-0">
                  <Skeleton className={cn("h-3 rounded-sm opacity-50", width.album)} />
                </TableCell>
                <TableCell className="w-16 shrink-0 justify-end p-0 text-right">
                  <Skeleton className={cn("h-3 rounded-sm opacity-50", width.time)} />
                </TableCell>
                <TableCell className="w-9 shrink-0 justify-end p-0">
                  <Skeleton className="size-7 rounded-md opacity-40" />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
