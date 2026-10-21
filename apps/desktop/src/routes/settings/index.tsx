import { createFileRoute } from '@tanstack/react-router'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { updatesQueryOpts } from '@/features/settings/queries/updates'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { RouteSection } from '@ongaku/ui'
import {
  RoutePendingState,
  RouteErrorState,
} from '@/components/feedback/route-ui-state'
import { SettingsHeader } from '@/features/settings/components'
import {
  GeneralTab,
  AppearanceTab,
  SystemTab,
  SystemTabTrigger,
} from '@/features/settings/tabs'
import { SettingsTabLoadingState } from '@/features/settings/ui-state'
import { useSystemHealth } from '@/features/settings/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ongaku/ui'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { systemBackgroundsOpts } from '@/features/settings/queries/backgrounds'
import { discordStatusQueryOpts } from '@/shared/queries/discord'

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
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.query(systemConfigQueryOpts()),
      context.queryClient.query(systemHealthQueryOpts()),
      context.queryClient.query(updatesQueryOpts()),
      context.queryClient.query(systemBackgroundsOpts()),
      context.queryClient.query(discordStatusQueryOpts()),
    ])
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { isLoading, refreshHealth } = useSystemHealth()

  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <SettingsHeader isLoading={isLoading} onRefresh={refreshHealth} />
      <RouteSection scrollable direction='col' gap='md' className='pb-12'>
        <Tabs defaultValue='general' className='w-full'>
          <TabsList variant='default' className='grid grid-cols-3 max-w-md'>
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

          <TabsContent value='general' className='flex flex-col gap-4 pt-2'>
            <Suspense fallback={<SettingsTabLoadingState />}>
              <GeneralTab />
            </Suspense>
          </TabsContent>

          <TabsContent value='appearance' className='flex flex-col gap-4 pt-2'>
            <Suspense fallback={<SettingsTabLoadingState />}>
              <AppearanceTab />
            </Suspense>
          </TabsContent>

          <TabsContent value='system' className='flex flex-col gap-4 pt-2'>
            <Suspense fallback={<SettingsTabLoadingState />}>
              <SystemTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </RouteSection>
    </div>
  )
}
