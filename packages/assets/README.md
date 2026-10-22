# @ongaku/assets

Single source of truth for Ongaku brand and product media.

## Contents

```text
public/
├── ongaku-logo.png
└── screenshots/
    ├── demo-app-1.webp
    ├── demo-app-2.webp
    ├── demo-app-3.webp
    └── demo-app-4.webp
```

## Optimizing screenshots

Drop new captures as `app-img-<number>.png` and run:

```bash
bun run screenshots:optimize
```

The script converts every source PNG to `demo-app-<number>.webp` at quality 80,
removes the original PNG and keeps the original resolution.

## Importing from an app

Assets are exported as files so Vite fingerprints and emits them with the rest
of the application bundle:

```tsx
import logo from '@ongaku/assets/logo'
import libraryShot from '@ongaku/assets/screenshots/demo-app-1.webp'
```

Use these imports for rendered `<img>` elements. Do not reference another
application's `public/` directory.

## Static files (favicon, manifest, social previews)

Some consumers need stable public URLs instead of hashed bundler output (for
example `index.html` favicons, `manifest.json` or Open Graph images). For those
cases, copy the assets with the sync script before dev/build:

```bash
bun scripts/sync.mjs public logo
bun scripts/sync.mjs public
```

The script resolves the target directory from the current working directory, so
it should be executed from the consuming app:

```json
{
  "scripts": {
    "assets:sync": "bun ../../packages/assets/scripts/sync.mjs public logo"
  }
}
```

Generated copies are build artifacts. They are ignored by git and regenerated
by the app `dev`/`build` scripts so Desktop, Web and documentation always share
the same source files.
