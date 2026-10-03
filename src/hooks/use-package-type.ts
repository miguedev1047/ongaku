import { useSuspenseQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useUpdateStore } from '@/shared/stores/actions'

/**
 * Resolves how the app is distributed (flatpak, exe, dmg, appimage, deb).
 * Suspends until the system health query resolves (preloaded in route loaders).
 *
 * In DEV mode, the Flatpak variant can be simulated from the settings card.
 */
export function usePackageType() {
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const simulateFlatpak = useUpdateStore((state) => state.simulateFlatpak)

  const isSimulated = import.meta.env.DEV && simulateFlatpak
  const isFlatpak = health.isFlatpak || isSimulated

  return {
    packageType: isFlatpak ? 'flatpak' : health.packageType,
    isFlatpak,
    isSimulated,
    supportsInAppUpdates: !isFlatpak,
  }
}
