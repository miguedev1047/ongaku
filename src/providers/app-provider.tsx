import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { HotkeysProvider } from "@tanstack/react-hotkeys"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: false, ignoreInputs: true }
      }}
    >
      <ThemeProvider
        storageKey="ongaku-theme"
        defaultTheme="system"
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </HotkeysProvider>
  )
}
