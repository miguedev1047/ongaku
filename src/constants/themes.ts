export type ThemeMode = "light" | "dark"

export const DEFAULT_THEME_MODE: ThemeMode = "dark"

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  nameKey: string
  descriptionKey: string
  /**
   * Preview dot colors: [lightPrimary, darkPrimary] or [lightBg, darkBg]
   */
  colors: {
    light: string
    dark: string
  }
}

export const REGISTERED_THEMES: readonly ThemeDefinition[] = [
  {
    id: "default",
    name: "Ongaku",
    description: "Default minimalist aesthetic for Ongaku",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.default.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.default.description",
    colors: {
      light: "#000000",
      dark: "#ffffff",
    },
  },
  {
    id: "zedative",
    name: "Zedative",
    description: "Technical engineering notebook with cobalt accents",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.zedative.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.zedative.description",
    colors: {
      light: "#1348dc",
      dark: "#4f7cf7",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    description: "Soothing pastel palette with vibrant purple primary",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.catppuccin.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.catppuccin.description",
    colors: {
      light: "#8839ef",
      dark: "#cba6f7",
    },
  },
  {
    id: "vintage-paper",
    name: "Vintage Paper",
    description: "Warm parchment tones inspired by classical literature",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.vintage-paper.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.vintage-paper.description",
    colors: {
      light: "#9c7049",
      dark: "#d1a87b",
    },
  },
  {
    id: "sakura",
    name: "Sakura",
    description: "Delicate cherry blossom aesthetic with soft crimson accents",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.sakura.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.sakura.description",
    colors: {
      light: "#e05263",
      dark: "#f27d88",
    },
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Vibrant streaming music green with dark contrast",
    nameKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.spotify.name",
    descriptionKey:
      "settings.tabs.appearance.appearance_and_interface.interface_theme.themes.spotify.description",
    colors: {
      light: "#1db954",
      dark: "#1ed760",
    },
  },
] as const

export const DEFAULT_THEME_ID = "default"
