// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import fsdPlugin from '@conarti/eslint-plugin-feature-sliced'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  // ─── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'electron-dist/**',
      'dist-electron-build/**',
      'vite.config.ts',
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN PROCESS: Electron / Node.js — Clean Architecture
  // ═══════════════════════════════════════════════════════════════════════════

  // Base TypeScript rules for ALL electron files
  {
    files: ['electron/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Electron main process uses CommonJS — require() is valid in this context
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ── Clean Architecture: Domain Layer (innermost circle) ───────────────────
  // Pure business objects and rules. Zero external dependencies.
  // CANNOT import from: application, infrastructure, ipc, handlers.
  {
    files: ['electron/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/application/**',
                '**/infrastructure/**',
                '**/ipc/**',
                '**/handlers/**',
              ],
              message:
                '[Clean Architecture] Domain is the innermost circle. It cannot depend on any outer layer.',
            },
          ],
        },
      ],
    },
  },

  // ── Clean Architecture: Repository Interfaces ─────────────────────────────
  // Abstractions (ports) that live at the domain boundary.
  // CANNOT import from: infrastructure implementations or outer layers.
  {
    files: ['electron/repositories/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**', '**/application/**', '**/ipc/**', '**/handlers/**'],
              message:
                '[Clean Architecture] Repository interfaces (ports) cannot depend on outer layers.',
            },
          ],
        },
      ],
    },
  },

  // ── Clean Architecture: Application Layer (Use Cases) ────────────────────
  // Orchestrates domain objects via repository interfaces.
  // CAN depend on: domain, repository interfaces.
  // CANNOT depend on: infrastructure implementations, transport layers.
  {
    files: ['electron/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message:
                '[Clean Architecture] Use Cases cannot depend on Infrastructure. Reference the repository interfaces in electron/repositories/ instead (Dependency Inversion Principle).',
            },
            {
              group: ['**/ipc/**', '**/handlers/**'],
              message:
                '[Clean Architecture] Use Cases cannot import from transport/adapter layers (ipc, handlers).',
            },
          ],
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERER PROCESS: React + Feature-Sliced Design (FSD)
  // Layer hierarchy (top → bottom): app > pages > widgets > features > entities > shared
  // ═══════════════════════════════════════════════════════════════════════════
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      // FSD architecture guardian
      '@conarti/feature-sliced': fsdPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── React rules ───────────────────────────────────────────────────────
      ...reactPlugin.configs.recommended.rules,
      // Disables react/react-in-jsx-scope for the new JSX transform (React 17+)
      ...reactPlugin.configs['jsx-runtime'].rules,

      // ── React Hooks rules ─────────────────────────────────────────────────
      ...reactHooksPlugin.configs.recommended.rules,

      // ── FSD Architecture Guardian ─────────────────────────────────────────
      //
      // Enforces unidirectional dependency rule:
      //   app → pages → widgets → features → entities → shared
      //
      // A lower layer CANNOT import from a layer above it.
      //   ✗ entities importing from features
      //   ✗ features importing from other features (cross-slice)
      //   ✗ shared importing from any FSD layer
      '@conarti/feature-sliced/layers-slices': 'error',

      // All cross-slice imports must go through the public API (index.ts).
      //   ✓ import { TimerStore } from '@/entities/timer'
      //   ✗ import { TimerStore } from '@/entities/timer/model/timerStore'
      // Note: src/app/index.tsx is excluded below (app is an entry-point layer, not a slice)
      '@conarti/feature-sliced/public-api': 'error',

      // Prevents bypassing the public API via relative path cross-slice imports.
      // Enforces absolute imports for cross-layer/cross-slice references.
      //   ✗ import { X } from '../../other-feature/ui/Component'
      //   ✓ import { X } from '@/features/other-feature'
      '@conarti/feature-sliced/absolute-relative': 'error',
    },
  },

  // ── FSD exception: src/app is the entry-point layer, not a slice ──────────
  // It has no public API consumers, so the public-api rule is a false positive.
  {
    files: ['src/app/**/*.ts', 'src/app/**/*.tsx'],
    rules: {
      '@conarti/feature-sliced/public-api': 'off',
    },
  },

  // ─── Prettier: disable all ESLint formatting rules that conflict ───────────
  // MUST be the last config in the array so it overrides everything above.
  prettierConfig,
)
