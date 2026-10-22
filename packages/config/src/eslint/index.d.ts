import type { Linter } from 'eslint'

export interface RestyleContract {
  pattern: string
  allow?: string[]
}

export declare const shadcnContracts: RestyleContract[]
export declare const defaultIgnores: string[]

export declare function createEslintConfig(
  ...customConfigs: (Linter.Config | Linter.Config[])[]
): Linter.Config[]

export declare const baseConfig: Linter.Config[]

export default baseConfig
