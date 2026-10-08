import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'
import { useQuery } from '@tanstack/react-query'

interface AppSidebarProviderProps
  extends React.ComponentProps<typeof SidebarProvider> {
  children: React.ReactNode
}

export function AppSidebarProvider({
  children,
  ...props
}: AppSidebarProviderProps) {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const { mutate: updateConfig } = useUpdateConfig()

  const isOpen = config?.toggle_sidebar === 'true'

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      updateConfig({
        key: 'toggle_sidebar',
        value: String(open),
      })
    },
    [updateConfig]
  )

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={handleOpenChange}
      defaultOpen={isOpen}
      {...props}
    >
      {children}
    </SidebarProvider>
  )
}
