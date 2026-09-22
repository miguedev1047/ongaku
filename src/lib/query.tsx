import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const REVALIDATE_INTERVAL = 5000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3000,
      refetchOnWindowFocus: false,
      refetchInterval: REVALIDATE_INTERVAL,
      refetchIntervalInBackground: false,
      retry: 1
    }
  }
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
