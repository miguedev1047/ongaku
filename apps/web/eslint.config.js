//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import { createEslintConfig } from "@ongaku/config/eslint"

export default createEslintConfig(
  ...tanstackConfig,
  {
    settings: {
      shadcn: {
        ui: "@ongaku/ui/components/ui",
      },
    },
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "import/consistent-type-specifier-style": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    ignores: ["eslint.config.js", ".prettierrc", "src/routeTree.gen.ts"],
  },
)
