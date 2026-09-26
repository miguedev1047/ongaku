import { useEffect } from "react"

export function usePreventWebviewShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey

      // Only block reload (F5, Ctrl+R, Cmd+R) in production build
      // In development mode (import.meta.env.DEV), reloading is preserved for developer workflow
      if (import.meta.env.PROD) {
        if (e.key === "F5" || (isModifier && e.key.toLowerCase() === "r")) {
          e.preventDefault()
        }
      }

      // Block browser print dialog (Ctrl+P, Cmd+P)
      if (isModifier && e.key.toLowerCase() === "p") {
        e.preventDefault()
      }

      // Block browser keyboard zoom (Ctrl + Plus, Minus, 0, =)
      if (isModifier && ["=", "+", "-", "0"].includes(e.key)) {
        e.preventDefault()
      }
    }

    const handleWheel = (e: WheelEvent) => {
      // Block accidental zoom with mouse wheel (Ctrl + Wheel)
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])
}
