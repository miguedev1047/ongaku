import '@/styles/main.css'
import '@/lib/i18n'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { queryClient, QueryProvider } from '@/lib/query'
import {
  RoutePendingState,
  RouteErrorState,
} from '@/components/feedback/route-ui-state'
import { AppProvider } from '@/providers/app-provider'
import { scan } from 'react-scan'
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

if (import.meta.env.DEV) {
  scan({ enabled: import.meta.env.DEV })
}

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
