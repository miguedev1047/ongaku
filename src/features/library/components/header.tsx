import { RouteHeader } from "@/components/ui/route-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { SearchLibrary } from "@/components/compounds/search"
import { LibraryReloadList } from "@/features/library/components"
import { useTranslation } from "react-i18next"

export function LibraryHeader() {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <SidebarTrigger className="-ml-1 max-md:block hidden" />
      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4 max-md:block hidden"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("library.your_library")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-1 ml-auto">
        <LibraryReloadList />
        <Suspense fallback={<Skeleton className="ml-auto w-52 h-6" />}>
          <SearchLibrary />
        </Suspense>
      </div>
    </RouteHeader>
  )
}
