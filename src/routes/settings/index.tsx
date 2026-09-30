import { createFileRoute } from '@tanstack/react-router'
import {
  systemHealthQueryOptions,
  systemUpdatesQueryOptions,
  systemBinariesInfoQueryOptions,
  systemBinariesCheckQueryOptions,
  systemConfigQueryOptions,
} from '@/shared/queries/system'
import { RouteSection } from '@/components/ui/route-section'
import {
  RoutePendingState,
  RouteErrorState,
} from '@/components/route-ui-state'
import {
  SettingsHeader,
  ServerHealthCard,
  DirectoriesStatusCard,
  BinariesStatusCard,
  AppUpdatesCard,
  AppearanceCard,
  SystemTabTrigger,
} from '@/features/settings/components'
import { SettingsTabLoadingState } from '@/features/settings/ui-state'
import { useSystemHealth } from '@/features/settings/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Suspense } from 'react'

export const Route = createFileRoute('/settings/')({
  pendingComponent: () => (
    <RoutePendingState
      title='Loading settings'
      message='Fetching system diagnostics and health status'
    />
  ),
  errorComponent: RouteErrorState,
  loader: ({ context }) => {
    context.queryClient.query(systemConfigQueryOptions())
    context.queryClient.query(systemHealthQueryOptions())
    context.queryClient.query(systemUpdatesQueryOptions())
    context.queryClient.query(systemBinariesInfoQueryOptions())
    context.queryClient.query(systemBinariesCheckQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, refreshHealth } = useSystemHealth()

  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <SettingsHeader
        isLoading={isLoading}
        onRefresh={refreshHealth}
      />
      <RouteSection className='flex-1 overflow-y-auto no-scrollbar pb-12 flex flex-col gap-4'>
        <Tabs
          defaultValue='general'
          className='w-full'
        >
          <TabsList
            variant='default'
            className='grid grid-cols-3 max-w-sm'
          >
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='appearance'>Appearance</TabsTrigger>
            <SystemTabTrigger />
          </TabsList>

          <TabsContent
            value='general'
            className='flex flex-col gap-4 pt-2'
          >
            <Suspense fallback={<SettingsTabLoadingState />}>
              <AppUpdatesCard />
            </Suspense>
          </TabsContent>

          <TabsContent
            value='appearance'
            className='flex flex-col gap-4 pt-2'
          >
            <Suspense fallback={<SettingsTabLoadingState />}>
              <AppearanceCard />
            </Suspense>
          </TabsContent>

          <TabsContent
            value='system'
            className='flex flex-col gap-4 pt-2'
          >
            <Suspense fallback={<SettingsTabLoadingState />}>
              <ServerHealthCard />
              <BinariesStatusCard />
              <DirectoriesStatusCard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </RouteSection>
    </div>
  )
}
