import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { flatConfigs } from 'eslint-plugin-import-x';
import { configs } from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tsConfigs } from 'typescript-eslint';

export default defineConfig([
  { ignores: ['dist/'] },
  {
    extends: [
      js.configs.recommended,
      configs['recommended-natural'],
      flatConfigs.recommended,
      flatConfigs.typescript,
      eslintConfigPrettier,
    ],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ignores: ['dist', '**/*.d.ts', '**/*.config.(c?[jt]s?(x))'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      js,
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...tsConfigs.recommended,
]);
