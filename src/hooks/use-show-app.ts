import { useEffect } from "react"
import { platformService } from "@/infrastructure/platform"

export function useShowApp() {
  useEffect(() => {
    const showWindow = async () => {
      await platformService.showWindow()
      await platformService.focusWindow()
    }
    showWindow().catch(console.error)
  }, [])
}
