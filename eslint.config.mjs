/*
 *   Copyright (c) 2026  @miaosong
 *   All rights reserved.
 *   
 */
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importSort from 'eslint-plugin-simple-import-sort'

export default tseslint.config({
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['*.js', '**/*/dist/**/*', 'packages/cli/templates/**/*'],
    rules: {
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        'no-unused-vars': 'error',
        'no-undef': 'warn',
        'no-console': 'error',
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    ['^\\w'],
                    ['^@\\w'],
                    ['^@/'],
                    ['^\\u0000'],
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
                ]
            }
        ],
        'simple-import-sort/exports': 'error'
    },
    languageOptions: {
        parser: tseslint.parser,
        globals: {
            ...globals.node
        },
        parserOptions: {
            project: ['./tsconfig.eslint.json', '**/*/tsconfig.json'],
            tsconfigRootDir: import.meta.dirname
        }
    },
    plugins: { 'simple-import-sort': importSort }
})
