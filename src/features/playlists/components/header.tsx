import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { SearchPlaylists } from "@/components/search"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { PlaylistsReloadList } from "@/features/playlists/components"

export function PlaylistHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 max-md:block hidden" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Playlists</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-1 ml-auto">
          <PlaylistsReloadList />
          <Suspense fallback={<Skeleton className="ml-auto w-52 h-8" />}>
            <SearchPlaylists />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
