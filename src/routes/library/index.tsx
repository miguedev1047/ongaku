import { Suspense } from "react"
import {
  LibraryHeader,
  LibraryStats,
  LibraryList
} from "@/features/library/components"
import {
  LibraryLoadingState,
  LibraryStatsSkeleton
} from "@/features/library/ui-state"
import { RouteSection } from "@/components/ui/route-section"
import { RoutePendingState, RouteErrorState } from "@/components/compounds/route-ui-state"
import { createFileRoute } from "@tanstack/react-router"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { useTranslation } from "react-i18next"

function LibraryPending() {
  const { t } = useTranslation()
  return (
    <RoutePendingState
      title={t("routes.library.pending_title")}
      message={t("routes.library.pending_message")}
    />
  )
}

export const Route = createFileRoute("/library/")({
  pendingComponent: LibraryPending,
  errorComponent: RouteErrorState,
  loader: ({ context }) => {
    context.queryClient.query(librarySongsQueryOpts())
  },
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="size-full flex flex-col overflow-hidden">
      <LibraryHeader />
      <RouteSection className="flex flex-col gap-4">
        <Suspense fallback={<LibraryStatsSkeleton />}>
          <LibraryStats />
        </Suspense>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<LibraryLoadingState />}>
            <LibraryList />
          </Suspense>
        </div>
      </RouteSection>
    </div>
  )
}
