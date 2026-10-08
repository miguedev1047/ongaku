import { Subscribe } from "@tanstack/react-table"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead
} from "@/components/ui/table"
import { SearchBatchBar } from "@/components/blocks/search-songs-list/search-batch-bar"
import { SearchSongTableRow } from "@/components/blocks/search-songs-list/search-table-row"
import {
  useSearchBatchSync,
  useSearchList
} from "@/components/blocks/search-songs-list/hooks"
import { useTranslation } from "react-i18next"
import { Show } from "@/components/utility/show"

interface SearchSongsListProps {
  data: TYoutubeSearchResult[]
}

export function SearchSongsList({ data }: SearchSongsListProps) {
  "use no memo"
  const { t } = useTranslation()

  const {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection
  } = useSearchList({ data })

  useSearchBatchSync({ rowSelection, setRowSelection, data })

  return (
    <div className="size-full flex flex-col overflow-hidden">
      <Table
        variant="flex"
        className="size-full flex flex-col overflow-hidden rounded-md"
      >
        {/* Table Header: exactly aligns with row columns */}
        <TableHeader className="shrink-0 bg-muted/20 border-b border-border/40">
          <TableRow className="border-b-0 hover:bg-transparent px-3 h-10 gap-3">
            {/* 1. Master Checkbox (32px) */}
            <TableHead className="w-8 shrink-0 justify-center p-0">
              <Subscribe
                source={table.atoms.rowSelection}
                selector={() => table.getIsAllRowsSelected()}
              >
                {(isAllSelected) => (
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={() => table.toggleAllRowsSelected()}
                    aria-label={t("common.select_all_songs")}
                  />
                )}
              </Subscribe>
            </TableHead>

            {/* 2. Cover spacer (36px) */}
            <TableHead className="size-9 shrink-0 justify-center p-0">
              {t("library.columns.cover")}
            </TableHead>

            {/* 3. Title column header (flex-1 min-w-0) */}
            <TableHead className="flex-1 min-w-0 flex items-center gap-2 p-0">
              <span>{t("library.columns.title")}</span>
              <span className="text-[11px] font-mono text-muted-foreground/70">
                <Show
                  when={data.length === 1}
                  fallback={`(${t("youtube_search.results_count_plural", { count: data.length })})`}
                >
                  {`(${t("youtube_search.results_count", { count: data.length })})`}
                </Show>
              </span>
            </TableHead>

            {/* 4. Duration column header (64px) */}
            <TableHead className="w-16 shrink-0 justify-end p-0 text-right">
              {t("library.columns.duration")}
            </TableHead>

            {/* 5. Actions spacer (36px) */}
            <TableHead className="w-9 shrink-0 p-0" />
          </TableRow>
        </TableHeader>

        {/* Virtualized Table Body */}
        <TableBody
          ref={scrollRef}
          className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar scroll-fade-y"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative"
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null

              return (
                <div
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <SearchSongTableRow row={row} />
                </div>
              )
            })}
          </div>
        </TableBody>
      </Table>

      {/* Floating Batch Actions Bar */}
      <SearchBatchBar />
    </div>
  )
}
