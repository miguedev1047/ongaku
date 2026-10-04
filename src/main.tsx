import '@/styles/main.css'
import '@/lib/i18n'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { queryClient, QueryProvider } from '@/lib/query'
import { RoutePendingState, RouteErrorState } from '@/components/route-ui-state'
import { AppProvider } from '@/providers/app-provider'
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

const hashMemory = createHashHistory()
const router = createRouter({
  routeTree,
  history: hashMemory,
  defaultPreload: 'intent',
  defaultPendingMs: 0,
  context: { queryClient },

  defaultPendingComponent: RoutePendingState,
  defaultErrorComponent: RouteErrorState,

  Wrap: ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      <QueryProvider>{children}</QueryProvider>
    </AppProvider>
  ),
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
