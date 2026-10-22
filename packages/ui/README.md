# @ongaku/ui

Shared UI primitives, theme provider and design tokens for Ongaku.

## Theme provider

There is a single theme implementation in this package, used by both
applications:

```text
src/providers/theme-provider/
├── theme-provider.tsx
├── theme-helpers.ts
├── theme-script.ts
├── mode-toggle.tsx
├── mode-select.tsx
└── index.ts
```

```ts
import {
  ModeSelect,
  ModeToggle,
  ThemeProvider,
  getThemeScript,
  useTheme,
} from '@ongaku/ui/providers/theme-provider'
```

### API

```ts
type ThemeMode = 'light' | 'dark' | 'system'

type ThemeProviderState = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  theme: string
  setTheme: (theme: string) => void
  resolvedMode: 'light' | 'dark'
}
```

`ThemeProvider` accepts `defaultMode`, `defaultTheme`, `modeStorageKey` and
`themeStorageKey`. The defaults keep the `ongaku-mode` and `ongaku-theme`
storage keys.

### Behavior

- `mode` drives `light`, `dark` or `system`; `system` follows the OS
  preference through `matchMedia`.
- `theme` selects the visual family and the `data-theme` attribute. The
  `default` family removes the attribute.
- `resolvedMode` is the effective mode after resolving `system`.
- The provider is SSR safe: it never reads `localStorage` or `matchMedia`
  while rendering, it hydrates on mount and it tolerates environments without
  `matchMedia` or `requestAnimationFrame`.

### Applying the theme before the first paint

`getThemeScript()` returns a self-contained inline script that reads the
stored preferences, resolves `system` and applies the classes, the
`data-theme` attribute and `color-scheme`. Applications inject it with
`ScriptOnce` during SSR (Web) or in the generated `index.html` (Desktop).

## Tests

```bash
bun --filter @ongaku/ui test
```

Unit tests live in `src/providers/theme-provider/tests/` and use the package
own Vitest setup (`vitest.config.ts` and `src/test/setup.ts`).
