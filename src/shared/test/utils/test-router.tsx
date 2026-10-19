import React from 'react'
import {
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from '@/routeTree.gen'
import { AppProvider } from '@/providers/app-provider'
import {
  RoutePendingState,
  RouteErrorState,
} from '@/components/feedback/route-ui-state'
import '@/lib/i18n'

export function createTestRouter(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })

  const history = createMemoryHistory({
    initialEntries: [initialPath],
  })

  const router = createRouter({
    routeTree,
    history,
    context: { queryClient },
    defaultPendingMs: 0,
    defaultPendingComponent: RoutePendingState,
    defaultErrorComponent: RouteErrorState,
    Wrap: ({ children }: { children: React.ReactNode }) => (
      <AppProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppProvider>
    ),
  })

  return { router, queryClient, history }
}
