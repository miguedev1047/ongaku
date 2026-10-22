# @ongaku/config

Shared technical configuration for the Ongaku monorepo. This package must not
contain application runtime, React, Tauri or i18n resources.

## Entry points

- `@ongaku/config`: small root surface with technical contracts
  (`shadcnContracts`, `defaultIgnores`). Importing it does not initialize ESLint.
- `@ongaku/config/eslint`: executable ESLint flat-config factory used by
  Desktop, Web and `packages/ui`.

```js
import { createEslintConfig } from '@ongaku/config/eslint'
```

## Internationalization

Translations belong to each application:

```text
apps/desktop/src/locales/
apps/web/src/locales/
```

If the applications ever need genuinely shared copy, create a separate
`@ongaku/i18n-common` package instead of adding translations here.
