import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // The build/asset scripts run under Node, not in a browser. Without this
    // every `console.log` in them is a lint error, which drowned out the real
    // findings — `npm run lint` reported 22 errors and none of them mattered.
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', fetch: 'readonly', Buffer: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
