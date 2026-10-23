# Ongaku Web

Public landing page and download center for Ongaku. Built with TanStack Start
and deployed to Cloudflare Workers.

## Development

From the repository root:

```bash
bun run dev:all
```

This starts the native Tauri desktop app (with its Vite server on port `1420`)
and the Web app on port `3000`. To work on the website alone from the root:

```bash
bun run dev:web
```

Equivalent alternatives:

```bash
bun --filter web dev
bun --filter web dev:web
```

To start only the Desktop frontend in the browser, without Tauri:

```bash
bun --filter desktop dev
```

The `dev` and `build` scripts sync the shared logo from `@ongaku/assets` into
`public/` before Vite starts, so the manifest and social icons use stable URLs.

## Build and checks

```bash
bun run typecheck
bun run lint
bun run build:web
```

`build:web` uses Turborepo and builds the website together with its workspace
dependencies (`@ongaku/ui`, `@ongaku/config`, `@ongaku/assets`).

## Cloudflare Workers

The app uses `@cloudflare/vite-plugin` and `wrangler.jsonc` with
`@tanstack/react-start/server-entry`.

```bash
bun --filter web cf:dev
bun --filter web cf-typegen
bun --filter web deploy
```

`deploy` builds first and then runs `wrangler deploy` with the configuration in
this directory. The Worker name is `ongaku-web`; update `wrangler.jsonc` before
attaching a custom domain.

`compatibility_date` is pinned to the newest date supported by the local
`workerd` build shipped with Wrangler. Bump it together with Wrangler when the
runtime supports a newer date.

The latest GitHub release is fetched inside a server function, cached for five
minutes at the edge (`cf.cacheTtl`) and in memory per Worker isolate. If GitHub
rate-limits the Worker, the landing renders the official releases fallback
without failing SSR or hydration.

To raise the GitHub API limit, configure an optional Worker secret. It is read
only on the server and must never use a `VITE_` prefix:

```bash
cd apps/web
bunx wrangler secret put GITHUB_TOKEN
```

`cf-typegen` writes `worker-configuration.d.ts`, which is ignored by git because
the landing has no bindings yet. Run the script again after adding any binding.

### GitHub Actions

`.github/workflows/web-deploy.yml` validates pull requests and deploys only from
`master` or a manual dispatch using the official
`cloudflare/wrangler-action@v4`. Configure these repository secrets:

- `CLOUDFLARE_API_TOKEN` — token with permission to deploy Workers.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account that owns the Worker.

For deploys from your machine, copy `.env.example` to `apps/web/.env` and fill
in the same two values. `apps/web/.env` is ignored by git.

## Structure

```text
src/
├── features/landing/   # Landing sections, content and constants
├── locales/            # Web-only en/es resources
├── routes/             # TanStack Start routes
├── router.tsx
└── styles/main.css     # Shared @ongaku/ui theme + landing utilities
```

## Internationalization

The website owns its own `i18next` instance and resources:

- `src/locales/en.json` and `src/locales/es.json`
- namespaces: `common`, `navigation`, `landing`, `downloads`, `footer`
- `src/lib/i18n.ts` initializes once with `en` as default and fallback
- `src/routes/__root.tsx` imports it and calls `useLanguageSync()`

`src/hooks/language-sync.ts` is called once from `src/routes/__root.tsx`. It
persists the preference in `localStorage` (`ongaku-language`), updates
`document.documentElement.lang`, and never touches `window` during SSR. The
accessible selector lives in the site header.

When adding copy, update both locale files. `src/shared/tests/i18n.test.ts`
checks namespace shape and key parity between languages.

## Theme

The website reuses the shared provider from `@ongaku/ui`:

```ts
import {
  ModeToggle,
  ThemeProvider,
  getThemeScript,
  useTheme,
} from '@ongaku/ui/providers/theme-provider'
```

- `src/routes/__root.tsx` renders the theme script with `ScriptOnce`, so the
  persisted theme is applied before the first paint and during SSR.
- The same script is injected in Desktop through its Vite config.
- `mode` supports `light`, `dark` and `system`; `theme` selects the visual
  family and the `data-theme` attribute.
- Preferences are stored in `ongaku-mode` and `ongaku-theme`.

`src/features/landing/tests/theme.test.tsx` covers the script and the theme
selector.

UI primitives come from `@ongaku/ui`; do not add local copies of shadcn
components. Image assets come from `@ongaku/assets`.
