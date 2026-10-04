import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['src/**/*.{ts,tsx}'],
  extends: [js.configs.recommended],
  languageOptions: {
    parser: tseslint.parser,
    globals: { ...globals.browser, ...globals.vitest },
  },
  plugins: { '@typescript-eslint': tseslint.plugin, react },
  settings: { react: { version: 'detect' } },
  rules: {
    'no-undef': 'off', // TypeScript checks undefined names.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
  },
});
