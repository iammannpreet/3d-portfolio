import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  {
    ignores: ['dist', 'models-src', 'shots', 'test-results', 'playwright-report', '.scratch'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // The 3D scene and the scroll rig mutate three.js objects and shared stores every frame by
    // design. The React Compiler lint rules flag that as a mistake; the classic hook rules stay on.
    files: ['src/scene/**/*.{ts,tsx}', 'src/scroll/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,ts}', 'tests/**/*.ts', '*.config.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.node,
    },
  },
)
