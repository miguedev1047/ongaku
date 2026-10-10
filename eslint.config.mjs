import { plugin as shadcn } from '@shadcn/lint'
import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'src-tauri/**',
      'node_modules/**',
      'src/routeTree.gen.ts',
    ],
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
          contracts: [
            {
              pattern: '^Button$',
              allow: [
                'layout',
                'w-*',
                'size-*',
                'mt-*',
                'mb-*',
                'my-*',
                'mx-*',
                'ml-*',
                'mr-*',
                'shrink-*',
                'grow-*',
                'gap-*',
                'self-*',
                'cursor-*',
                'select-*',
              ],
            },
            {
              pattern: '^Card(Header|Content|Footer|Title|Description)?$',
              allow: ['layout', 'w-full', 'mt-*', 'mb-*', 'p-*', 'gap-*'],
            },
            {
              pattern: '^CardWrapper$',
              allow: [
                'layout',
                'w-*',
                'mt-*',
                'mb-*',
                'my-*',
                'shrink-*',
                'grow-*',
                'cursor-*',
              ],
            },
            {
              pattern: '^Route(Section|Header)?$',
              allow: [
                'layout',
                'w-full',
                'h-*',
                'gap-*',
                'select-none',
                'items-*',
                'justify-*',
                'p-*',
                'py-*',
                'px-*',
                'pb-*',
                'z-*',
              ],
            },
            {
              pattern: '^Badge$',
              allow: [
                'layout',
                'w-*',
                'text-*',
                'shrink-*',
                'self-*',
                'cursor-*',
              ],
            },
            {
              pattern: '^SidebarMenuBadge$',
              allow: ['layout', 'w-*', 'shrink-*'],
            },
            {
              pattern: '^Empty(Header|Title|Description|Content)?$',
              allow: [
                'layout',
                'max-w-*',
                'w-full',
                'my-*',
                'py-*',
                'text-*',
                'gap-*',
              ],
            },
            {
              pattern: '^EmptyMedia$',
              allow: ['layout', 'shrink-*', 'size-*'],
            },
            {
              pattern: '^Skeleton$',
              allow: [
                'layout',
                'w-*',
                'h-*',
                'size-*',
                'rounded-*',
                'opacity-*',
                'aspect-*',
                'flex-*',
                'relative',
                'shrink-*',
              ],
            },
            {
              pattern: '^Spinner$',
              allow: ['layout', 'size-*', 'text-*', 'shrink-*'],
            },
            {
              pattern: '^Tabs(Content|List|Trigger)?$',
              allow: [
                'layout',
                'w-*',
                'gap-*',
                'p-*',
                'pt-*',
                'pb-*',
                'mt-*',
                'mb-*',
                'space-y-*',
              ],
            },
            {
              pattern: '^Table(Header|Body|Footer|Row|Head|Cell)?$',
              allow: [
                'layout',
                'w-*',
                'h-*',
                'gap-*',
                'hidden',
                'flex',
                'items-*',
                'justify-*',
                'p-*',
                'px-*',
                'py-*',
              ],
            },
            {
              pattern: '^Dialog(Content|Header|Footer|Title|Description)?$',
              allow: [
                'layout',
                'max-w-*',
                'w-full',
                'gap-*',
                'p-*',
                'px-*',
                'py-*',
              ],
            },
            {
              pattern: '^Sheet(Content|Header|Footer|Title|Description)?$',
              allow: [
                'layout',
                'w-*',
                'max-w-*',
                'gap-*',
                'p-*',
                'px-*',
                'py-*',
              ],
            },
            {
              pattern: '^Popover(Content)?$',
              allow: ['layout', 'w-*', 'min-w-*', 'max-w-*', 'p-*', 'gap-*'],
            },
            {
              pattern: '^DropdownMenu(Content|Item|Label|Separator|Group)?$',
              allow: [
                'layout',
                'w-*',
                'min-w-*',
                'max-w-*',
                'gap-*',
                'text-*',
                'cursor-*',
              ],
            },
            {
              pattern: '^ContextMenu(Content|Item|Label|Separator|Group)?$',
              allow: [
                'layout',
                'w-*',
                'min-w-*',
                'max-w-*',
                'gap-*',
                'text-*',
                'cursor-*',
              ],
            },
            {
              pattern:
                '^Item(Group|Separator|Media|Content|Title|Description|Actions|Header|Footer)?$',
              allow: ['layout', 'w-*', 'shrink-*', 'gap-*', 'cursor-*'],
            },
            {
              pattern:
                '^Command(Dialog|Input|List|VirtualList|Empty|Group|Item|Separator|Shortcut)?$',
              allow: ['layout', 'w-*', 'max-w-*', 'h-*', 'gap-*'],
            },
            {
              pattern: '^Alert(Title|Description|Action)?$',
              allow: ['layout', 'w-full', 'gap-*', 'my-*', 'mt-*', 'mb-*'],
            },
            {
              pattern:
                '^AlertDialog(Content|Header|Footer|Title|Description|Action|Cancel)?$',
              allow: ['layout', 'gap-*', 'w-*', 'max-w-*'],
            },
            { pattern: '^Input$', allow: ['layout', 'w-full', 'text-*'] },
            { pattern: '^Textarea$', allow: ['layout', 'w-full', 'min-h-*'] },
            { pattern: '^Label$', allow: ['layout', 'text-*'] },
            {
              pattern:
                '^Sidebar(Header|Content|Footer|Group|Menu|MenuItem|MenuButton|MenuBadge|MenuSub|Rail|Trigger|Inset)?$',
              allow: [
                'layout',
                'bg-*',
                'flex-*',
                'min-w-*',
                'min-h-*',
                'overflow-*',
                'gap-*',
                'p-*',
                'px-*',
                'py-*',
                'border-*',
              ],
            },
            { pattern: '^Tooltip(Content)?$', allow: ['layout', 'gap-*'] },
            { pattern: '^RadioGroup(Item)?$', allow: ['layout', 'gap-*'] },
            {
              pattern: '^Player(Title|Artist|Album)?$',
              allow: ['layout', 'truncate', 'line-clamp-*'],
            },
            {
              pattern: '^InputGroup(Input|Addon)?$',
              allow: ['layout', 'w-full', 'text-*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**'],
    rules: {
      'shadcn/no-restyle': 'off',
    },
  },
])
