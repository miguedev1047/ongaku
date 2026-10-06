import { useNetworkState as useHookNetworkState } from "@uidotdev/usehooks"

export function useNetworkState() {
  const network = useHookNetworkState()
  const isOnline = network.online ?? (typeof navigator !== "undefined" ? navigator.onLine : true)

  return {
    ...network,
    isOnline,
    online: isOnline,
  }
}
