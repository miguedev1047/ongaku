import { createEslintConfig } from '@ongaku/config/eslint'

export default createEslintConfig({
  ignores: ['src-tauri/**', 'src/routeTree.gen.ts'],
})
