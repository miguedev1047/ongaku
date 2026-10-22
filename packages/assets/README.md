# @ongaku/assets

Single source of truth for Ongaku brand and product media.

## Contents

```text
public/
├── ongaku-logo.png
└── screenshots/
    ├── app-img-1.png
    ├── app-img-2.png
    ├── app-img-3.png
    └── app-img-4.png
```

## Importing from an app

Assets are exported as files so Vite fingerprints and emits them with the rest
of the application bundle:

```tsx
import logo from '@ongaku/assets/logo'
import libraryShot from '@ongaku/assets/screenshots/app-img-1.png'
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
