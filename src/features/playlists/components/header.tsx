import { RouteHeader } from "@/components/ui/route-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { SearchPlaylists } from "@/components/compounds/search"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { PlaylistsReloadList } from "@/features/playlists/components"

import { useTranslation } from "react-i18next"

export function PlaylistHeader() {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <SidebarTrigger className="-ml-1 max-md:block hidden" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('playlists.header.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-1 ml-auto">
        <PlaylistsReloadList />
        <Suspense fallback={<Skeleton className="ml-auto w-52 h-6" />}>
          <SearchPlaylists />
        </Suspense>
      </div>
    </RouteHeader>
  )
}
