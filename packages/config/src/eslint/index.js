import { plugin as shadcn } from '@shadcn/lint'
import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import { shadcnContracts } from './contracts.js'

export { shadcnContracts }

export const defaultIgnores = ['dist/**', 'node_modules/**', '.turbo/**']

/**
 * Creates an ESLint flat configuration for Ongaku apps and packages.
 *
 * @param {import('eslint').Linter.Config | import('eslint').Linter.Config[]} [customConfigs]
 * @returns {import('eslint').Linter.Config[]}
 */
export function createEslintConfig(...customConfigs) {
  return defineConfig([
    {
      ignores: defaultIgnores,
    },
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { shadcn },
      rules: {
        'shadcn/no-arbitrary-values': 'error',
        'shadcn/no-restyle': [
          'warn',
          {
            allow: ['layout'],
            contracts: shadcnContracts,
          },
        ],
      },
    },
    {
      files: ['src/components/ui/**', 'src/components/reui/**'],
      rules: {
        'shadcn/no-restyle': 'off',
      },
    },
    ...customConfigs.flat(),
  ])
}

export const baseConfig = createEslintConfig()

export default baseConfig
