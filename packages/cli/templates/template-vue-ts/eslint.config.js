import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import vueEslintParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import importSort from 'eslint-plugin-simple-import-sort'

export default [
    {
        ignores: ['dist/**', '**/dist/**']
    },
    {
        files: ['**/*.{ts,tsx,vue}'],
        languageOptions: {
            parser: vueEslintParser,
            parserOptions: {
                parser: tsParser
            },
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        plugins: {
            vue: pluginVue,
            'simple-import-sort': importSort
        },
        rules: {
            ...js.configs.recommended.rules,
            ...pluginVue.configs['flat/recommended'].rules,
            'no-console': 'error',
            'simple-import-sort/imports': 'error'
        }
    }
]
