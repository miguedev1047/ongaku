import { createFileRoute } from '@tanstack/react-router'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { updatesQueryOpts } from '@/shared/queries/updates'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { RouteSection } from '@/components/ui/route-section'
import {
  RoutePendingState,
  RouteErrorState,
} from '@/components/compounds/route-ui-state'
import {
  SettingsHeader,
  ServerHealthCard,
  DirectoriesStatusCard,
  BinariesStatusCard,
  AppUpdatesCard,
  ThemeSelection,
  PlayerPositionOptions,
  FolderColorOptions,
  AppWallpapersSelection,
  LanguageSelection,
  SystemTabTrigger,
} from '@/features/settings/components'
import { SettingsTabLoadingState } from '@/features/settings/ui-state'
import { useSystemHealth } from '@/features/settings/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { systemBackgroundsOpts } from '@/shared/queries/backgrounds'

function SettingsPending() {
  const { t } = useTranslation()
  return (
    <RoutePendingState
      title={t('routes.settings.pending_title')}
      message={t('routes.settings.pending_message')}
    />
  )
}

export const Route = createFileRoute('/settings/')({
  pendingComponent: SettingsPending,
  errorComponent: RouteErrorState,
  loader: ({ context }) => {
    context.queryClient.query(systemConfigQueryOpts())
    context.queryClient.query(systemHealthQueryOpts())
    context.queryClient.query(updatesQueryOpts())
    context.queryClient.query(systemBackgroundsOpts())
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { isLoading, refreshHealth } = useSystemHealth()

  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <SettingsHeader
        isLoading={isLoading}
        onRefresh={refreshHealth}
      />
      <RouteSection
        scrollable
        direction='col'
        gap='md'
        className='pb-12'
      >
        <Tabs
          defaultValue='general'
          className='w-full'
        >
          <TabsList
            variant='default'
            className='grid grid-cols-3 max-w-md'
          >
            <TabsTrigger value='general'>
              {t('settings.tab_general')}
            </TabsTrigger>
            <TabsTrigger value='appearance'>
              {t('settings.tab_appearance')}
            </TabsTrigger>
            <SystemTabTrigger>
              {t('settings.tabs.system.title')}
            </SystemTabTrigger>
          </TabsList>

          <TabsContent
            value='general'
            className='flex flex-col gap-4 pt-2'
          >
            <Suspense fallback={<SettingsTabLoadingState />}>
              <LanguageSelection />
              <AppUpdatesCard />
            </Suspense>
          </TabsContent>

          <TabsContent
            value='appearance'
            className='flex flex-col gap-4 pt-2'
          >
            <Suspense fallback={<SettingsTabLoadingState />}>
              <ThemeSelection />
              <PlayerPositionOptions />
              <FolderColorOptions />
              <AppWallpapersSelection />
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
