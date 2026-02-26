import css from '@eslint/css';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { flatConfigs } from 'eslint-plugin-import-x';
import { configs } from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { configs as tsConfigs, parser as tsParser } from 'typescript-eslint';

export default defineConfig([
  {
    extends: [
      'js/recommended',
      configs['recommended-natural'],
      flatConfigs.recommended,
      flatConfigs.typescript,
      eslintConfigPrettier,
    ],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    ignores: ['dist', '**/*.d.ts', '**/*.config.(c?[jt]s?(x))'],
    languageOptions: { globals: globals.browser },
    plugins: {
      js,
      'unused-imports': unusedImports,
    },
  },
  tsConfigs.recommended,
  ...pluginVue.configs['flat/essential'].map((config) => ({
    ...config,
    files: ['**/*.vue'],
  })),
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tsParser } } },
  {
    extends: ['css/recommended'],
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    rules: { 'css/no-invalid-properties': 'off', 'css/use-baseline': 'off' },
  },
]);
