import { ThemeProvider } from '@/components/compounds/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HotkeysProvider } from '@tanstack/react-hotkeys'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: false, ignoreInputs: true },
      }}
    >
      <ThemeProvider
        defaultMode="dark"
        defaultTheme="default"
        modeStorageKey="ongaku-mode"
        themeStorageKey="ongaku-theme"
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </HotkeysProvider>
  )
}
