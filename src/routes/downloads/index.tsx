import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { checkBinariesQueryOpts } from "@/shared/queries/binaries"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  CheckBinaries,
  DownloadForm,
  DownloadStatus
} from "@/features/downloads/components"

export const Route = createFileRoute("/downloads/")({
  component: RouteComponent,
  pendingComponent: () => <p>Loading download page...</p>,
  errorComponent: () => <p>Error to load download page</p>,
  loader: async ({ context }) => {
    context.queryClient.query(checkBinariesQueryOpts())
  }
})

function RouteComponent() {
  return (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Button
          nativeButton={false}
          render={<Link to="/playlists" />}
        >
          Back
        </Button>
        <h3>Download song from Youtube</h3>
      </div>

      <Suspense fallback={<Spinner />}>
        <CheckBinaries />
        <DownloadStatus />
        <DownloadForm />
      </Suspense>
    </div>
  )
}
