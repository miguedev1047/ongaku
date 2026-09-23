import { useEffect } from "react"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"

export function useShowApp() {
  useEffect(() => {
    const showWindow = async () => {
      const win = getCurrentWebviewWindow()
      await win.show()
      await win.setFocus()
    }
    showWindow().catch(console.error)
  }, [])
}
